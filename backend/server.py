from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import random
import re
import time
import threading
from dataclasses import dataclass, field
from fpdf import FPDF
from docx import Document
from io import BytesIO

@dataclass
class DocumentData:
    text: str
    pin: str
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    last_accessed: float = field(default_factory=time.time)

    @property
    def word_count(self) -> int:
        text = re.sub('<[^<]+?>', '', self.text)
        return len(text.split())

    @property
    def char_count(self) -> int:
        text = re.sub('<[^<]+?>', '', self.text)
        return len(text)

    @property
    def is_expired(self, max_age: int = 600) -> bool:
        return time.time() - self.updated_at > max_age


app = Flask(__name__)
CORS(app)

DOCUMENT_EXPIRY = int(os.environ.get('DOCUMENT_EXPIRY', 600))
STORAGE_LIMIT = int(os.environ.get('STORAGE_LIMIT', 1000))

storage_lock = threading.Lock()
storage: dict[str, DocumentData] = {}


def _is_easy_pin(pin: str) -> bool:
    return (
        pin in ('0000', '1111', '2222', '3333', '4444', '5555',
                 '6666', '7777', '8888', '9999', '1234', '4321')
        or pin[0] == pin[1] == pin[2] == pin[3]
    )


def _generate_pin() -> str:
    for _ in range(100):
        pin = str(random.randint(1000, 9999))
        if not _is_easy_pin(pin) and pin not in storage:
            return pin
    return str(random.randint(1000, 9999))


def _cleanup_expired():
    now = time.time()
    expired = [k for k, v in storage.items() if now - v.updated_at > DOCUMENT_EXPIRY]
    for k in expired:
        del storage[k]


def _background_cleanup():
    while True:
        time.sleep(60)
        with storage_lock:
            _cleanup_expired()


cleanup_thread = threading.Thread(target=_background_cleanup, daemon=True)
cleanup_thread.start()


@app.route('/health', methods=['GET'])
def health_check():
    with storage_lock:
        active_docs = sum(
            1 for d in storage.values() if not d.is_expired(DOCUMENT_EXPIRY)
        )
    return jsonify({
        "status": "ok",
        "active_documents": active_docs,
        "expiry_seconds": DOCUMENT_EXPIRY
    })


@app.route('/save', methods=['POST'])
def save_document():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON"}), 400

    text = data.get("text", "")
    if not isinstance(text, str):
        return jsonify({"success": False, "error": "Text must be a string"}), 400

    if len(text) > 500_000:
        return jsonify({"success": False, "error": "Document too large (max 500KB)"}), 413

    pin = data.get("pin", "")

    with storage_lock:
        _cleanup_expired()

        if len(storage) >= STORAGE_LIMIT and pin not in storage:
            return jsonify({
                "success": False,
                "error": "Storage full, please try again later"
            }), 503

        if pin and pin in storage:
            doc = storage[pin]
            doc.text = text
            doc.updated_at = time.time()
            return jsonify({
                "success": True,
                "code": pin,
                "message": "Document updated"
            })

        new_pin = _generate_pin()
        storage[new_pin] = DocumentData(text=text, pin=new_pin)
        return jsonify({
            "success": True,
            "code": new_pin,
            "message": "Document saved"
        })


@app.route('/retrieve/<pin>', methods=['GET'])
def retrieve_document(pin):
    if not pin or not pin.isdigit() or len(pin) != 4:
        return jsonify({
            "success": False,
            "error": "Invalid PIN format"
        }), 400

    with storage_lock:
        _cleanup_expired()

        doc = storage.get(pin)
        if not doc:
            return jsonify({
                "success": False,
                "error": "Invalid or expired PIN"
            }), 404

        doc.last_accessed = time.time()
        return jsonify({
            "success": True,
            "text": doc.text,
            "word_count": doc.word_count,
            "char_count": doc.char_count,
        })


@app.route('/download/<fmt>', methods=['POST'])
def download_document(fmt):
    if fmt not in ('pdf', 'docx'):
        return jsonify({"success": False, "error": "Unsupported format"}), 400

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON"}), 400

    text = data.get("text", "")
    if not isinstance(text, str) or not text.strip():
        return jsonify({"success": False, "error": "Empty document"}), 400

    plain = text.replace('<br>', '\n').replace('</p>', '\n\n').replace('<p>', '')
    plain = re.sub('<[^<]+?>', '', plain)

    if fmt == 'pdf':
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.multi_cell(0, 10, plain)
        buf = BytesIO()
        pdf.output(buf)
        buf.seek(0)
        return send_file(
            buf,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='document.pdf'
        )

    doc = Document()
    for paragraph in plain.split('\n\n'):
        doc.add_paragraph(paragraph.strip())
    buf = BytesIO()
    doc.save(buf)
    buf.seek(0)
    return send_file(
        buf,
        mimetype='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        as_attachment=True,
        download_name='document.docx'
    )


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
