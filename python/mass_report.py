import sys
import asyncio
import json

# Fix for Python 3.14 - Create event loop before importing Pyrogram
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)

from pyrogram import Client
from pyrogram.raw.functions.account import ReportPeer
from pyrogram.raw.types import *


def get_reason(text):
    if text == "Report for child abuse":
        return InputReportReasonChildAbuse()
    elif text == "Report for impersonation":
        return InputReportReasonFake()
    elif text == "Report for copyrighted content":
        return InputReportReasonCopyright()
    elif text == "Report an irrelevant geogroup":
        return InputReportReasonGeoIrrelevant()
    elif text == "Reason for Pornography":
        return InputReportReasonPornography()
    elif text == "Report an illegal durg":
        return InputReportReasonIllegalDrugs()
    elif text == "Report for offensive person detail":
        return InputReportReasonSpam()
    elif text == "Report for spam":
        return InputReportReasonPersonalDetails()
    elif text == "Report for Violence":
        return InputReportReasonViolence()


async def main(message, reports_per_session=1, delay_between_reports=2):
    config = json.load(open("python/config.json"))
    resportreaso = message
    resportreason = get_reason(message)
    
    target = config['Target']
    total_reports = 0
    
    for account in config["accounts"]:
        string = account["Session_String"]
        Name = account['OwnerName']
        async with Client(name="Session", session_string=string) as app:
            try:
                peer = await app.resolve_peer(target)
                
                if hasattr(peer, 'channel_id'):
                    peer_input = InputPeerChannel(channel_id=peer.channel_id, access_hash=peer.access_hash)
                elif hasattr(peer, 'user_id'):
                    peer_input = InputPeerUser(user_id=peer.user_id, access_hash=peer.access_hash)
                else:
                    print(f"FAILED|{Name}|Unsupported peer type")
                    continue
                
                session_success = 0
                session_failed = 0
                
                for i in range(reports_per_session):
                    try:
                        report_peer = ReportPeer(
                            peer=peer_input, 
                            reason=resportreason, 
                            message=resportreaso
                        )
                        result = await app.invoke(report_peer)
                        session_success += 1
                        total_reports += 1
                        print(f"PROGRESS|{Name}|{i+1}/{reports_per_session}")
                        
                        if i < reports_per_session - 1:
                            await asyncio.sleep(delay_between_reports)
                    except Exception as e:
                        session_failed += 1
                        print(f"FAILED|{Name}|Report {i+1}: {str(e)}")
                
                if session_success > 0:
                    print(f"SUCCESS|{Name}|{session_success}/{reports_per_session} reports submitted")
                    
            except Exception as e:
                print(f"FAILED|{Name}|{str(e)}")
            
                
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python mass_report.py <reason> [reports_per_session] [delay]")
        sys.exit(1)

    input_string = sys.argv[1]
    reports_per_session = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    delay = int(sys.argv[3]) if len(sys.argv) > 3 else 2
    
    try:
        asyncio.run(main(message=input_string, reports_per_session=reports_per_session, delay_between_reports=delay))
    except Exception as e:
        print(f"ERROR|Script|{str(e)}")
