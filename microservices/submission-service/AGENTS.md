# Submission Service Agent Instructions

## Service Overview

**Workspace:** `microservices/submission-service/`
**Type:** Python FastAPI Microservice
**Port:** 8000
**Health Endpoint:** `http://localhost:8000/health`
**Framework:** FastAPI with Celery for background tasks

## Module Responsibility

The submission service handles:
- Replay file upload and validation
- Replay parsing coordination (via Celery tasks)
- Submission status tracking
- Integration with storage (MinIO/S3)
- Message queue integration (RabbitMQ)
- Notification dispatch on submission events

## Key Architectural Patterns

### 1. FastAPI Application Structure

```
submission-service/
├── app/
│   ├── api/
│   │   ├── routes/        # API route handlers
│   │   └── deps.py        # Dependencies
│   ├── core/
│   │   ├── config.py      # Configuration
│   │   └── security.py    # Security utilities
│   ├── models/            # SQLAlchemy models
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   ├── tasks/             # Celery tasks
│   └── utils/             # Utilities
├── tests/
│   ├── unit/
│   └── integration/
└── celery_worker.py       # Celery entry point
```

### 2. API Route Pattern

```python
# app/api/routes/submission.py
from fastapi import APIRouter, Depends, UploadFile, File
from app.api import deps
from app.schemas import submission as schemas
from app.services import submission_service

router = APIRouter()

@router.post("/submit", response_model=schemas.Submission)
async def submit_replay(
    replay_file: UploadFile = File(...),
    current_user: dict = Depends(deps.get_current_user),
):
    """Submit a replay file for processing."""
    return await submission_service.create_submission(
        file=replay_file,
        user=current_user,
    )

@router.get("/{submission_id}", response_model=schemas.Submission)
async def get_submission(
    submission_id: str,
    current_user: dict = Depends(deps.get_current_user),
):
    """Get submission status and results."""
    return await submission_service.get_submission(submission_id)
```

### 3. Celery Task Pattern

```python
# app/tasks/replay_parse.py
from celery import Celery
from app.services import replay_parser

app = Celery('submission_service')
app.config_from_object('app.core.config')

@app.task(bind=True, max_retries=3)
def parse_replay_task(self, submission_id: str):
    """Background task to parse replay file."""
    try:
        result = replay_parser.parse(submission_id)
        return {"status": "success", "data": result}
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
```

### 4. Service Layer Pattern

```python
# app/services/submission_service.py
from app.models import Submission
from app.schemas import submission as schemas
from app.tasks import replay_parse

class SubmissionService:
    async def create_submission(
        self,
        file: UploadFile,
        user: dict,
    ) -> Submission:
        # Save file to storage
        file_path = await self._save_file(file)
        
        # Create submission record
        submission = await self._create_record(file_path, user)
        
        # Queue parsing task
        replay_parse.parse_replay_task.delay(submission.id)
        
        return submission
    
    async def _save_file(self, file: UploadFile) -> str:
        # Implementation
        pass
    
    async def _create_record(self, file_path: str, user: dict) -> Submission:
        # Implementation
        pass

submission_service = SubmissionService()
```

## Test Patterns

### Location
- Unit tests: `tests/unit/test_*.py`
- Integration tests: `tests/integration/test_*.py`
- API tests: `tests/api/test_*.py`

### Test Structure

```python
# tests/unit/test_submission_service.py
import pytest
from unittest.mock import AsyncMock, patch
from app.services.submission_service import SubmissionService

@pytest.fixture
def submission_service():
    return SubmissionService()

@pytest.mark.asyncio
async def test_create_submission(submission_service):
    # Mock file upload
    mock_file = AsyncMock()
    mock_file.filename = "test.replay"
    
    # Mock user
    mock_user = {"id": "user-123", "email": "test@example.com"}
    
    # Mock dependencies
    with patch.object(submission_service, '_save_file') as mock_save:
        with patch.object(submission_service, '_create_record') as mock_create:
            mock_save.return_value = "/path/to/file.replay"
            mock_create.return_value = {"id": "sub-123"}
            
            result = await submission_service.create_submission(
                file=mock_file,
                user=mock_user,
            )
            
            assert result["id"] == "sub-123"
            mock_save.assert_called_once()
            mock_create.assert_called_once()
```

### Running Tests

```bash
# All tests
pytest

# Specific test file
pytest tests/unit/test_submission_service.py

# With coverage
pytest --cov=app --cov-report=html

# Run linting
flake8 app/
black --check app/
```

## Common Pitfalls

### ❌ Anti-Patterns

1. **Blocking operations in async routes**
   ```python
   # BAD: Blocking I/O in async route
   @router.post("/submit")
   async def submit_replay(file: UploadFile):
       # ❌ Don't do this
       with open(file.filename, 'rb') as f:
           data = f.read()  # Blocks event loop
   ```

2. **Direct database access in routes**
   ```python
   # BAD: DB access in route
   @router.get("/{id}")
   async def get_submission(id: str):
       # ❌ Don't do this
       return db.query(Submission).filter(Submission.id == id).first()
   ```

3. **No error handling in Celery tasks**
   ```python
   # BAD: No error handling
   @app.task
   def parse_replay(submission_id: str):
       result = parser.parse(submission_id)  # Might fail
       save_result(result)  # Might fail
   ```

### ✅ Best Practices

1. **Use service layer for business logic**
   ```python
   # GOOD: Delegate to service
   @router.post("/submit")
   async def submit_replay(
       file: UploadFile,
       current_user: dict = Depends(get_current_user),
   ):
       return await submission_service.create_submission(file, current_user)
   ```

2. **Use async database operations**
   ```python
   # GOOD: Async DB access
   async def get_submission(submission_id: str) -> Submission:
       async with get_db_session() as session:
           result = await session.execute(
               select(Submission).where(Submission.id == submission_id)
           )
           return result.scalar_one_or_none()
   ```

3. **Handle Celery task errors**
   ```python
   # GOOD: Error handling with retry
   @app.task(bind=True, max_retries=3)
   def parse_replay_task(self, submission_id: str):
       try:
           result = parser.parse(submission_id)
           return {"status": "success", "data": result}
       except ParserError as exc:
           # Don't retry parser errors
           logger.error(f"Parser error: {exc}")
           raise
       except Exception as exc:
           # Retry other errors
           raise self.retry(exc=exc, countdown=60)
   ```

## Architectural Rules

### Code Organization
- ✅ Routes only handle HTTP concerns
- ✅ Services contain business logic
- ✅ Tasks handle background processing
- ✅ Schemas define data validation
- ❌ Business logic in routes
- ❌ HTTP concerns in services

### Data Flow
1. Route receives request
2. Validates with Pydantic schema
3. Calls service layer
4. Service uses repository/models
5. Returns response through route

### Message Queue Integration
- ✅ Use Celery for background tasks
- ✅ Define task retries for transient failures
- ✅ Log task execution
- ✅ Monitor task queues
- ❌ Long-running operations in routes
- ❌ Direct RabbitMQ operations (use Celery)

## Configuration

### Environment Variables

```bash
# Required
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5434/submission
REDIS_URL=redis://localhost:6379/0
RABBITMQ_URL=amqp://admin:localrabbitpass@localhost:5672//
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=localminiopass

# Optional
CELERY_WORKERS=4
LOG_LEVEL=INFO
```

### Pydantic Settings

```python
# app/core/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    database_url: str
    redis_url: str
    rabbitmq_url: str
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    celery_workers: int = 4
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"

settings = Settings()
```

## Debugging Commands

```bash
# View service logs
docker-compose logs -f submission-service

# Check health
curl http://localhost:8000/health

# Check Celery worker
docker-compose exec submission-service celery -A celery_worker inspect active

# Check task queue
docker-compose exec rabbitmq rabbitmq-diagnostics list_queues

# Access MinIO storage
docker-compose exec minio mc alias set local http://localhost:9000 admin localminiopass
docker-compose exec minio mc ls local/submissions/
```

## Common Tasks

### Adding a New API Endpoint

1. Add route handler: `app/api/routes/<resource>.py`
2. Define Pydantic schemas: `app/schemas/<resource>.py`
3. Implement service method: `app/services/<resource>.py`
4. Add tests: `tests/api/test_<resource>.py`
5. Update API documentation (auto-generated by FastAPI)

### Adding a New Celery Task

1. Create task: `app/tasks/<task_name>.py`
2. Define task decorator with retry logic
3. Add error handling
4. Queue task from service layer
5. Add task tests: `tests/unit/test_tasks.py`

### Integrating with New Storage

1. Add storage client: `app/utils/storage.py`
2. Configure in settings
3. Use in service layer
4. Add integration tests

## Testing Requirements

### For All Changes
- [ ] Unit tests for service methods
- [ ] API endpoint tests
- [ ] Error case coverage
- [ ] Celery task tests (if applicable)

### For Database Changes
- [ ] Migration tested
- [ ] Rollback tested
- [ ] Data integrity verified

### For API Changes
- [ ] Backwards compatibility checked
- [ ] OpenAPI spec updated (auto-generated)
- [ ] Client impact assessed

## Related Documentation

- **Root AGENTS.md:** `../../AGENTS.md`
- **Task Protocol:** `../../reports/agent-task-protocol.md`
- **Harness Charter:** `../../reports/agent-harness-charter.md`
- **Local Runtime:** `../../reports/agent-harness-local-runtime.md`
- **Service Manifest:** `../../scripts/harness/service-manifest.json`
