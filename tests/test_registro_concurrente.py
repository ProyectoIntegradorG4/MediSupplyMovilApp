import asyncio
import aiohttp
import json
import random
import string
import time
from datetime import datetime

# Configuración similar a la de la aplicación
CONFIG = {
    'API_URL': 'http://localhost:8001',  # URL del user-service
    'TIMEOUT': 10000,
    'HEADERS': {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MediSupply-Test/1.0.0',
        'Origin': 'http://localhost:8081',  # Simular origen de Expo
        'Referer': 'http://localhost:8081/',  # Simular referencia de Expo
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
    }
}

async def register_user(session, index, start_time):
    url = f"{CONFIG['API_URL']}/register"
    
    # Datos de registro con email único usando timestamp y número aleatorio
    timestamp = int(time.time() * 1000)  # milliseconds
    random_suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=6))
    unique_email = f'user_{timestamp}_{random_suffix}_{index}@example.com'
    
    data = {
        'nit': '901234567',
        'nombre': 'Wilson Aponte',
        'email': unique_email,
        'password': 'Wilson12*'
    }
    
    try:
        # Primero hacer una petición OPTIONS para simular el comportamiento del navegador
        async with session.options(url, headers=CONFIG['HEADERS']) as options_response:
            print(f'\nUsuario {index} - OPTIONS request:')
            print(f'Status: {options_response.status}')
            print('CORS Headers:')
            for header, value in options_response.headers.items():
                if header.lower().startswith('access-control-'):
                    print(f'  {header}: {value}')
        
        # Luego hacer la petición POST real
        async with session.post(url, json=data, headers=CONFIG['HEADERS']) as response:
            request_time = time.time() - start_time
            
            try:
                result = await response.json()
            except:
                result = await response.text()
                
            print(f'\nUsuario {index} - POST request:')
            print(f'Status: {response.status}')
            print(f'Tiempo: {request_time:.3f}s')
            print('Headers de respuesta:')
            for header, value in response.headers.items():
                print(f'  {header}: {value}')
            print('Respuesta:')
            print(json.dumps(result, indent=2) if isinstance(result, (dict, list)) else result)
            
            return {
                'index': index,
                'status': response.status,
                'time': request_time,
                'start_time': time.time() - start_time,
                'headers': dict(response.headers),
                'result': result
            }
    except Exception as e:
        print(f'\nError registrando usuario {index}:')
        print(f'Tipo de error: {type(e).__name__}')
        print(f'Mensaje: {str(e)}')
        return {
            'index': index,
            'status': None,
            'time': time.time() - start_time,
            'start_time': time.time() - start_time,
            'error': f"{type(e).__name__}: {str(e)}"
        }

async def main():
    print("\nIniciando prueba de registro concurrente en MediSupply")
    print("=" * 60)
    print(f"URL: {CONFIG['API_URL']}/register")
    print(f"Headers: {json.dumps(CONFIG['HEADERS'], indent=2)}")
    print("=" * 60)
    
    # Número de registros simultáneos
    num_users = 10
    start_time = time.time()
    
    # Configurar timeout y límites de conexión
    timeout = aiohttp.ClientTimeout(total=30)
    connector = aiohttp.TCPConnector(limit=num_users)
    
    async with aiohttp.ClientSession(timeout=timeout, connector=connector) as session:
        tasks = [register_user(session, i+1, start_time) for i in range(num_users)]
        results = await asyncio.gather(*tasks)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # Análisis de resultados
    successful = [r for r in results if r['status'] == 200]
    response_times = [r['time'] for r in results if 'time' in r]
    
    print("\nEstadísticas de la prueba:")
    print("=" * 60)
    print(f"Tiempo total de ejecución: {total_time:.3f} segundos")
    if response_times:
        print(f"Tiempo de respuesta promedio: {sum(response_times)/len(response_times):.3f} segundos")
        print(f"Tiempo de respuesta mínimo: {min(response_times):.3f} segundos")
        print(f"Tiempo de respuesta máximo: {max(response_times):.3f} segundos")
    
    print(f"\nResumen de resultados:")
    print("=" * 60)
    print(f"Total de intentos: {num_users}")
    print(f"Exitosos: {len(successful)}")
    print(f"Fallidos: {num_users - len(successful)}")

if __name__ == '__main__':
    asyncio.run(main())