import json
import os
import hashlib
import hmac
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_token(user_id: int, email: str) -> str:
    secret = os.environ.get('JWT_SECRET', 'default-secret-key')
    data = f"{user_id}:{email}"
    signature = hmac.new(secret.encode(), data.encode(), hashlib.sha256).hexdigest()
    return f"{user_id}:{email}:{signature}"

def verify_token(token: str) -> Dict[str, Any] | None:
    try:
        parts = token.split(':')
        if len(parts) != 3:
            return None
        
        user_id, email, signature = parts
        secret = os.environ.get('JWT_SECRET', 'default-secret-key')
        data = f"{user_id}:{email}"
        expected_signature = hmac.new(secret.encode(), data.encode(), hashlib.sha256).hexdigest()
        
        if signature == expected_signature:
            return {'user_id': int(user_id), 'email': email}
        return None
    except:
        return None

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: User registration and login endpoint
    Args: event with httpMethod, body (email, password, name for register)
    Returns: HTTP response with user token and data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    action = body_data.get('action')
    email = body_data.get('email', '').strip().lower()
    password = body_data.get('password', '')
    
    if not email or not password:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Email и пароль обязательны'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if action == 'register':
            name = body_data.get('name', '').strip()
            if not name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Имя обязательно'})
                }
            
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            existing = cursor.fetchone()
            
            if existing:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
                }
            
            password_hash = hash_password(password)
            cursor.execute(
                "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id, email, name",
                (email, password_hash, name)
            )
            user = cursor.fetchone()
            conn.commit()
            
            token = create_token(user['id'], user['email'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name']
                    }
                })
            }
        
        elif action == 'login':
            password_hash = hash_password(password)
            cursor.execute(
                "SELECT id, email, name FROM users WHERE email = %s AND password_hash = %s",
                (email, password_hash)
            )
            user = cursor.fetchone()
            
            if not user:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            token = create_token(user['id'], user['email'])
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name']
                    }
                })
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'})
            }
    
    finally:
        cursor.close()
        conn.close()
