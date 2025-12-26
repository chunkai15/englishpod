#!/bin/bash
# Progress monitoring script for PARALLEL subtitle generation

echo "==========================================="
echo "PARALLEL Subtitle Generation Progress"
echo "==========================================="
echo ""

# Count total lessons
TOTAL=365

# Count generated subtitles
GENERATED=$(ls -1 subtitles/*.vtt 2>/dev/null | wc -l | tr -d ' ')

# Calculate percentage
PERCENT=$(echo "scale=2; ($GENERATED / $TOTAL) * 100" | bc)

echo "📊 Generated: $GENERATED / $TOTAL ($PERCENT%)"
echo ""

# Show recent batches
echo "Recent activity:"
echo "-------------------------------------------"
tail -30 subtitle-generation-parallel.log 2>/dev/null | grep -A 20 "Batch" | tail -25
echo ""

# Check if processes are running
WHISPER_COUNT=$(ps aux | grep -c "[w]hisper.*englishpod")

if [ "$WHISPER_COUNT" -gt 0 ]; then
    echo "✅ Generation process is RUNNING"
    echo "⚡ Active Whisper processes: $WHISPER_COUNT"
    echo ""
    echo "Currently processing:"
    ps aux | grep "[w]hisper.*englishpod" | awk '{
        split($13, a, "/");
        split(a[length(a)], b, ".");
        printf "  - %s (running: %s)\n", b[1], $10
    }'
else
    echo "❌ Generation process is NOT running"
fi

echo "==========================================="

# Show estimated completion
if [ -f subtitle-generation-parallel.log ]; then
    REMAINING_TIME=$(tail -100 subtitle-generation-parallel.log | grep "Estimated time remaining" | tail -1 | awk '{print $5, $6}')
    if [ ! -z "$REMAINING_TIME" ]; then
        echo "⏳ Estimated time remaining: $REMAINING_TIME"
        echo "==========================================="
    fi
fi



