from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas.reports import (
    AIReportRequest,
    AIReportResponse,
    ReportGenerateRequest,
    ReportResponse,
    ReportTemplate,
)
from ..services.report_generator import generate_ai_report, generate_report, get_templates

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/templates", response_model=list[ReportTemplate])
async def list_templates():
    return get_templates()


@router.post("/generate", response_model=ReportResponse)
async def generate(request: ReportGenerateRequest):
    try:
        return generate_report(request.template)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/ai", response_model=AIReportResponse)
async def generate_ai(request: AIReportRequest):
    try:
        return generate_ai_report(request.prompt)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI report generation failed: {str(e)}")
