import sys
import asyncio
import json

loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

from pyrogram import Client

async def check_session():
    try:
        config = json.load(open("python/check_session.json"))
        session_string = config['Session_String']
        
        async with Client(name="CheckSession", session_string=session_string) as app:
            me = await app.get_me()
            print(f"VALID|{me.first_name}|{me.id}")
            return True
    except Exception as e:
        print(f"INVALID|{str(e)}")
        return False

if __name__ == "__main__":
    try:
        asyncio.run(check_session())
    except Exception as e:
        print(f"ERROR|{str(e)}")
