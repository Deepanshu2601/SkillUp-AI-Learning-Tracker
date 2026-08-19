package services

import (
	"bytes"
	"io"

	"github.com/ledongthuc/pdf"
)

// ReadAll helper - reads all data from io.Reader
func ReadAll(r io.Reader) ([]byte, error) {
	data, err := io.ReadAll(r)
	return data, err
}

// PDFToText extracts text from PDF bytes
func PDFToText(data []byte) string {
	reader := bytes.NewReader(data)
	p, err := pdf.NewReader(reader, int64(len(data)))
	if err != nil {
		return ""
	}

	var text string
	num := p.NumPage()
	for i := 1; i <= num; i++ {
		page := p.Page(i)
		if page.V.IsNull() {
			continue
		}
		str, _ := page.GetPlainText(nil)
		text += str + "\n"
	}
	return text
}

