#!/bin/bash
exec > /tmp/shutdown-monitor.log 2>&1
echo "Shutdown monitor started at $(date)"

MAX_RUNTIME=1800
START_TIME=$(date +%s)

echo "Waiting 30 seconds for runner to update and start..."
sleep 30

NO_RUNNER_COUNT=0

while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED -gt $MAX_RUNTIME ]; then
        echo "Max runtime exceeded ($MAX_RUNTIME seconds), forcing shutdown..."
        sync
        poweroff -f
        exit 0
    fi
    
    RUNNER_COUNT=$(pgrep -f "Runner.Worker" | wc -l)
    
    echo "$(date): Runner process count: $RUNNER_COUNT, Elapsed: ${ELAPSED}s, No-runner streak: $NO_RUNNER_COUNT"
    
    if [ "$RUNNER_COUNT" -eq 0 ]; then
        NO_RUNNER_COUNT=$((NO_RUNNER_COUNT + 1))
        
        if [ $NO_RUNNER_COUNT -ge 2 ]; then
            echo "No runner processes found for $NO_RUNNER_COUNT checks, shutting down now..."
            sync
            poweroff -f
            exit 0
        fi
    else
        NO_RUNNER_COUNT=0
    fi
    
    sleep 3
done

