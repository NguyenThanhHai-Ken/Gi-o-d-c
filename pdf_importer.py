"""PDF to JSON importer (placeholder)
Usage: python3 pdf_importer.py input.pdf output.json
This script extracts text per page using PyPDF2 or pdfminer if available.
It produces a simple JSON with pages. It does NOT parse math/structure automatically;
after extraction you will need to transform text into lessons/questions.
"""
import sys, json
try:
    from PyPDF2 import PdfReader
except Exception as e:
    PdfReader = None

def extract_pdf(path):
    if PdfReader is None:
        print('PyPDF2 not installed. Please pip install PyPDF2 to use this script.')
        return None
    reader = PdfReader(path)
    pages = []
    for p in reader.pages:
        try:
            pages.append(p.extract_text() or "")
        except:
            pages.append("")
    return pages

def main():
    if len(sys.argv) < 3:
        print('Usage: python pdf_importer.py input.pdf output.json')
        return
    inp = sys.argv[1]; out = sys.argv[2]
    pages = extract_pdf(inp)
    if pages is None:
        print('Extraction not available. Install PyPDF2 and try again.')
        return
    data = {'source': inp, 'pages': pages, 'pageCount': len(pages)}
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('Wrote', out)

if __name__ == "__main__": main()
