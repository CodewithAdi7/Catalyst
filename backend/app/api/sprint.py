from fastapi import APIRouter, Depends

from app.models.sprint import (
    CalendarDeadlineRequest,
    CalendarDeadlineResponse,
    CodeScaffold,
    MaterializeScaffoldRequest,
    MaterializeScaffoldResponse,
    NextStepRequest,
    SprintInitializationRequest,
    SprintInitializationResponse,
    TaskPrioritizationRequest,
    TaskPrioritizationResponse,
    TaskStatusRequest,
    TaskStatusResponse,
)
from app.services.sprint_service import SprintService

router = APIRouter(prefix="/api/sprint", tags=["sprint"])


def get_sprint_service() -> SprintService:
    return SprintService()


@router.post("/initialize", response_model=SprintInitializationResponse)
async def initialize_sprint(
    request: SprintInitializationRequest,
    service: SprintService = Depends(get_sprint_service),
) -> SprintInitializationResponse:
    return await service.initialize_sprint(request)


@router.post("/next-step", response_model=CodeScaffold)
async def fetch_next_step_scaffold(
    request: NextStepRequest,
    service: SprintService = Depends(get_sprint_service),
) -> CodeScaffold:
    return await service.next_step_scaffold(request)


@router.post("/calendar-fit", response_model=CalendarDeadlineResponse)
async def assess_calendar_fit(
    request: CalendarDeadlineRequest,
    service: SprintService = Depends(get_sprint_service),
) -> CalendarDeadlineResponse:
    return CalendarDeadlineResponse(
        assessments=await service.assess_calendar_deadlines(request)
    )


@router.post("/prioritize", response_model=TaskPrioritizationResponse)
async def prioritize_tasks(
    request: TaskPrioritizationRequest,
    service: SprintService = Depends(get_sprint_service),
) -> TaskPrioritizationResponse:
    return await service.prioritize_tasks(request)


@router.post("/materialize-scaffold", response_model=MaterializeScaffoldResponse)
def materialize_scaffold(
    request: MaterializeScaffoldRequest,
    service: SprintService = Depends(get_sprint_service),
) -> MaterializeScaffoldResponse:
    return service.materialize_scaffold(request)


@router.post("/check-task-status", response_model=TaskStatusResponse)
def check_task_status(
    request: TaskStatusRequest,
    service: SprintService = Depends(get_sprint_service),
) -> TaskStatusResponse:
    return service.check_task_status(request)
