from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


OUTPUT_DIR = Path(__file__).resolve().parents[1] / "public" / "demo-pdfs"

DOCUMENTS = [
    {
        "filename": "analisis-estadistico-ventas-carlos.pdf",
        "title": "Análisis estadístico de ventas locales",
        "student": "Carlos Mendoza",
        "summary": "Documento de prueba para la tarea de estadística. Incluye el análisis de una muestra de ventas, medidas de tendencia central y una conclusión breve.",
    },
    {
        "filename": "modelo-negocio-cafe-maria.pdf",
        "title": "Modelo de negocio: café artesanal",
        "student": "María Loor",
        "summary": "Documento de prueba con propuesta de valor, clientes, costos y canales para un emprendimiento local de café artesanal.",
    },
    {
        "filename": "panel-academico-accesible-andrea.pdf",
        "title": "Panel académico responsivo y accesible",
        "student": "Andrea Mera",
        "summary": "Documento de prueba que presenta una propuesta de panel para tareas pendientes, calificaciones y accesibilidad en dispositivos móviles.",
    },
    {
        "filename": "tradiciones-manabi-juan.pdf",
        "title": "Exposición: tradiciones de Manabí",
        "student": "Juan Alcívar",
        "summary": "Guion de prueba para una exposición breve sobre tradiciones manabitas, con introducción, desarrollo y cierre.",
    },
    {
        "filename": "estadistica-ventas-luis.pdf",
        "title": "Estadística de ventas locales",
        "student": "Luis Moreira",
        "summary": "Documento de prueba con resultados de media, mediana, dispersión y recomendaciones a partir de una muestra de ventas locales.",
    },
]


def build_pdf(document: dict[str, str]) -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUTPUT_DIR / document["filename"]
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DemoTitle",
        parent=styles["Title"],
        textColor=HexColor("#0F3D6E"),
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=25,
        spaceAfter=14,
    )
    body_style = ParagraphStyle(
        "DemoBody",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=11,
        leading=17,
        textColor=HexColor("#243447"),
    )
    document_pdf = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        rightMargin=2.2 * cm,
        leftMargin=2.2 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2.5 * cm,
        title=document["title"],
        author=document["student"],
    )
    story = [
        Paragraph("ENTREGAS ACADÉMICAS - DEMOSTRACIÓN", body_style),
        Spacer(1, 0.6 * cm),
        Paragraph(document["title"], title_style),
        Paragraph(f"Estudiante: <b>{document['student']}</b>", body_style),
        Spacer(1, 0.45 * cm),
        Paragraph(document["summary"], body_style),
        Spacer(1, 0.65 * cm),
        Paragraph(
            "Este es un archivo ficticio para la demostración de la hackatón. "
            "Se puede guardar primero en el almacenamiento personal y luego "
            "asociar a una tarea real mediante el asistente de voz.",
            body_style,
        ),
    ]
    document_pdf.build(story)


for item in DOCUMENTS:
    build_pdf(item)
    print(f"OK {item['filename']}")
