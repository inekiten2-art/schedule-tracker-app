import json
import os
from typing import Dict, Any
from datetime import date
import psycopg2
from psycopg2.extras import RealDictCursor

def get_user_from_token(token: str) -> int | None:
    if not token:
        return None
    try:
        parts = token.split(':')
        if len(parts) >= 1:
            return int(parts[0])
    except:
        pass
    return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage task attempts for subjects
    Args: event with httpMethod, headers (X-Auth-Token), body for POST
    Returns: HTTP response with attempts list or created attempt
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    headers = event.get('headers', {})
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    user_id = get_user_from_token(token)
    
    if not user_id:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            subject_id = params.get('subjectId')
            
            if not subject_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Subject ID required'})
                }
            
            cursor.execute(
                "SELECT id FROM subjects WHERE id = %s AND user_id = %s",
                (subject_id, user_id)
            )
            subject = cursor.fetchone()
            
            if not subject:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Subject not found'})
                }
            
            cursor.execute(
                "SELECT * FROM task_attempts WHERE subject_id = %s ORDER BY created_at ASC",
                (subject_id,)
            )
            attempts = cursor.fetchall()
            
            result = []
            for attempt in attempts:
                item = {
                    'taskNumber': attempt['task_number'],
                    'status': attempt['status'],
                    'date': str(attempt['attempt_date'])
                }
                if attempt['points'] is not None:
                    item['points'] = attempt['points']
                if attempt['max_points'] is not None:
                    item['maxPoints'] = attempt['max_points']
                result.append(item)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            subject_id = body_data.get('subjectId')
            
            cursor.execute(
                "SELECT id FROM subjects WHERE id = %s AND user_id = %s",
                (subject_id, user_id)
            )
            subject = cursor.fetchone()
            
            if not subject:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Subject not found'})
                }
            
            today = date.today()
            
            cursor.execute(
                """INSERT INTO task_attempts 
                (subject_id, task_number, status, points, max_points, attempt_date) 
                VALUES (%s, %s, %s, %s, %s, %s) 
                RETURNING *""",
                (
                    subject_id,
                    body_data['taskNumber'],
                    body_data['status'],
                    body_data.get('points'),
                    body_data.get('maxPoints'),
                    today
                )
            )
            attempt = cursor.fetchone()
            conn.commit()
            
            result = {
                'taskNumber': attempt['task_number'],
                'status': attempt['status'],
                'date': str(attempt['attempt_date'])
            }
            if attempt['points'] is not None:
                result['points'] = attempt['points']
            if attempt['max_points'] is not None:
                result['maxPoints'] = attempt['max_points']
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
    
    finally:
        cursor.close()
        conn.close()
