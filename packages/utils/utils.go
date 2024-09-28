package utils

import (
	_ "embed"
	"github.com/tidwall/gjson"
	"io/ioutil"
	"log"
)

type Utils struct{}

func NewUtils() *Utils {
	return &Utils{}
}

func (u *Utils) GetVersion() string {
	data, err := ioutil.ReadFile("wails.json")
	if err != nil {
		log.Fatalf("Failed to read wails.json: %v", err)
	}
	version := gjson.Get(string(data), "info.ProductVersion")
	return version.String()
}
