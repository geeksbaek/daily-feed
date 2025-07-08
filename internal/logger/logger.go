package logger

import (
	"log"
	"os"
)

type Logger interface {
	Info(msg string, args ...interface{})
	Error(msg string, args ...interface{})
	Fatal(msg string, args ...interface{})
}

type defaultLogger struct {
	infoLogger  *log.Logger
	errorLogger *log.Logger
}

func New() Logger {
	return &defaultLogger{
		infoLogger:  log.New(os.Stdout, "INFO: ", log.LstdFlags),
		errorLogger: log.New(os.Stderr, "ERROR: ", log.LstdFlags),
	}
}

func (l *defaultLogger) Info(msg string, args ...interface{}) {
	if len(args) > 0 {
		l.infoLogger.Printf(msg, args...)
	} else {
		l.infoLogger.Print(msg)
	}
}

func (l *defaultLogger) Error(msg string, args ...interface{}) {
	if len(args) > 0 {
		l.errorLogger.Printf(msg, args...)
	} else {
		l.errorLogger.Print(msg)
	}
}

func (l *defaultLogger) Fatal(msg string, args ...interface{}) {
	if len(args) > 0 {
		l.errorLogger.Fatalf(msg, args...)
	} else {
		l.errorLogger.Fatal(msg)
	}
}