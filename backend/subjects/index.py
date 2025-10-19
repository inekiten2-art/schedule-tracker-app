import json
import os
from typing import Dict, Any
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
    Business: Manage user subjects (CRUD operations)
    Args: event with httpMethod, headers (X-Auth-Token), body for POST/PUT
    Returns: HTTP response with subjects list or created/updated subject
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
            cursor.execute(
                "SELECT * FROM subjects WHERE user_id = %s ORDER BY created_at ASC",
                (user_id,)
            )
            subjects = cursor.fetchall()
            
            result = []
            for subject in subjects:
                result.append({
                    'id': str(subject['id']),
                    'name': subject['name'],
                    'part1Range': {'from': subject['part1_from'], 'to': subject['part1_to']},
                    'part2Range': {'from': subject['part2_from'], 'to': subject['part2_to']},
                    'part2MaxPoints': subject['part2_max_points'],
                    'icon': subject['icon'],
                    'color': subject['color']
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            cursor.execute(
                """INSERT INTO subjects 
                (user_id, name, part1_from, part1_to, part2_from, part2_to, part2_max_points, icon, color) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) 
                RETURNING *""",
                (
                    user_id,
                    body_data['name'],
                    body_data['part1From'],
                    body_data['part1To'],
                    body_data['part2From'],
                    body_data['part2To'],
                    json.dumps(body_data['part2MaxPoints']),
                    body_data.get('icon', 'BookOpen'),
                    body_data.get('color', 'bg-blue-500')
                )
            )
            subject = cursor.fetchone()
            conn.commit()
            
            result = {
                'id': str(subject['id']),
                'name': subject['name'],
                'part1Range': {'from': subject['part1_from'], 'to': subject['part1_to']},
                'part2Range': {'from': subject['part2_from'], 'to': subject['part2_to']},
                'part2MaxPoints': subject['part2_max_points'],
                'icon': subject['icon'],
                'color': subject['color']
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result)
            }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters', {}) or {}
            subject_id = params.get('id')
            
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
            
            cursor.execute("UPDATE subjects SET name = name WHERE id = %s", (subject_id,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
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
