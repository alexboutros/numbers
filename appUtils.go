package main

import (
	_ "embed"
	"github.com/tidwall/gjson"
	"log"
)

type AppUtils struct{}

//go:embed wails.json
var wailsJSON string

func AppUtilsHandler() *AppUtils {
	return &AppUtils{}
}

func (u *AppUtils) GetVersion() string {
	if wailsJSON == "" {
		log.Fatalf("Failed to embed wails.json")
	}
	version := gjson.Get(wailsJSON, "info.ProductVersion")
	return version.String()
}
