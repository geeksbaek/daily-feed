# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Build and run
go run .
go build -o daily-feed .

# Run with custom options
go run . --preset developer --feeds feeds.csv --cutoff 24 --timeout 15

# Run tests
go test ./...
go test ./pkg/feed/       # Run feed package tests specifically

# Development with specific presets
go run . --preset casual | pbcopy        # Copy output to clipboard (macOS)
go run . --preset developer > output.md  # Save to file
```

## Architecture Overview

Daily Feed is a Go-based RSS/Atom feed aggregator with AI-powered summarization:

### Core Components

- **`internal/app/`**: Application bootstrapping and main orchestration logic
- **`pkg/models/`**: Data models for RSS, Atom feeds, and internal types
- **`pkg/config/`**: Configuration validation and management
- **`pkg/feed/`**: Feed loading (CSV) and processing (RSS/Atom parsing)
- **`pkg/ai/`**: AI summarization using Google Gemini API and output formatting
- **`pkg/utils/`**: Utilities for XML entity fixing, date parsing, error handling

### Feed Processing Flow

1. Load feed list from CSV file (`feeds.csv`)
2. Fetch and parse RSS/Atom feeds with automatic format detection
3. Filter items based on cutoff time (default: 24 hours)
4. Generate AI summary using Gemini API with configurable presets
5. Output formatted markdown to stdout

### Key Features

- **Multi-format support**: RSS 2.0 and Atom 1.0 feeds
- **4 summary presets**: `default`, `developer`, `casual`, `community`
- **Robust error handling**: Custom error types with wrapping
- **Concurrent processing**: Goroutines for feed fetching
- **XML entity fixing**: Handles malformed XML entities

## Configuration

Environment variables:
- `GEMINI_API_KEY`: Required for AI summarization

Command-line flags:
- `--feeds`: CSV file path (default: `feeds.csv`)
- `--model`: Gemini model (default: `gemini-2.5-pro`)
- `--cutoff`: Hours to look back (default: 24)
- `--timeout`: HTTP timeout seconds (default: 15)
- `--preset`: Summary style (default: `default`)

## Testing

The test suite focuses on feed processing reliability:
- Individual problematic feed testing
- XML entity fixing validation
- Date parsing across different formats
- HTTP header compatibility
- Cutoff time application

Test files are located in `pkg/feed/processor_test.go`.

## Dependencies

- **Google Generative AI SDK**: `google.golang.org/genai` for Gemini API
- **Standard library**: Primarily uses Go stdlib for HTTP, XML, CSV processing
- **Go 1.23+**: Uses modern Go features and toolchain