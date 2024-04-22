#!make
include .env
export

run_client:
	python run_client.py

run_server:
	python run_server.py --port $(PORT) --backend faster_whisper
