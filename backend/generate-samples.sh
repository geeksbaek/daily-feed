#!/bin/bash

# samples 디렉토리 생성하는 스크립트
# 여러 프리셋과 모델 조합으로 병렬 실행

set -e

SAMPLES_DIR="samples"
MODELS=("gemini-2.5-pro")
PRESETS=("default" "casual" "community" "developer")

# samples 디렉토리 생성
mkdir -p "$SAMPLES_DIR"

# 각 모델별로 디렉토리 생성
for model in "${MODELS[@]}"; do
    mkdir -p "$SAMPLES_DIR/$model"
done

# 백그라운드 작업을 위한 배열
declare -a pids=()

# 각 모델과 프리셋 조합으로 병렬 실행
for model in "${MODELS[@]}"; do
    for preset in "${PRESETS[@]}"; do
        echo "Starting: $model with $preset preset"
        
        # 백그라운드에서 실행
        (
            ./daily-feed -model="$model" -preset="$preset" > "$SAMPLES_DIR/$model/summary_$preset.md"
            echo "Completed: $model with $preset preset"
        ) &
        
        # PID 저장
        pids+=($!)
    done
done

echo "All tasks started. Waiting for completion..."

# 모든 백그라운드 작업 완료 대기
for pid in "${pids[@]}"; do
    wait "$pid"
done

echo "All sample files generated successfully!"
echo "Check the following directories:"
for model in "${MODELS[@]}"; do
    echo "  - $SAMPLES_DIR/$model/"
done