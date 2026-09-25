#!/usr/bin/env python3
"""prestocks-port-proxy: Windows/WSL bridge -> Next"""
import socket
import threading

LISTEN = ("0.0.0.0", 3000)
TARGET = ("127.0.0.1", 13999)

def pipe(src, dst):
    try:
        while True:
            data = src.recv(65536)
            if not data:
                break
            dst.sendall(data)
    except OSError:
        pass
    finally:
        try:
            dst.shutdown(socket.SHUT_WR)
        except OSError:
            pass

def handle(client):
    upstream = None
    try:
        client.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        upstream = socket.create_connection(TARGET, timeout=10)
        upstream.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
        t1 = threading.Thread(target=pipe, args=(client, upstream), daemon=True)
        t2 = threading.Thread(target=pipe, args=(upstream, client), daemon=True)
        t1.start(); t2.start(); t1.join(); t2.join()
    except Exception as e:
        print(f"handle error: {e}", flush=True)
    finally:
        for s in (client, upstream):
            if s is None: continue
            try: s.close()
            except OSError: pass

def main():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind(LISTEN)
    srv.listen(128)
    print(f"listening {LISTEN} -> {TARGET}", flush=True)
    while True:
        client, addr = srv.accept()
        print(f"conn from {addr}", flush=True)
        threading.Thread(target=handle, args=(client,), daemon=True).start()

if __name__ == "__main__":
    main()