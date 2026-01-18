#!/usr/bin/bash

# Parse arguments
DEV=false
PORT=${PORT:-8000}
while [[ $# -gt 0 ]]; do
  case $1 in
    --dev)
      if [[ "$2" == "true" ]] || [[ "$2" == "True" ]]; then
        DEV=true
      fi
      shift 2
      ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    dev=true|dev=True)
      DEV=true
      shift
      ;;
    port=*)
      PORT="${1#*=}"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Run migrations if in dev mode
if [ "$DEV" = true ]; then
  echo "Running migrations..."
  python3 manage.py migrate
fi

# Start the Django development server
python3 manage.py runserver 0.0.0.0:$PORT