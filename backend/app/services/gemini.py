import json
from typing import Any, TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel

from app.core.config import get_settings

T = TypeVar("T", bound=BaseModel)


class GeminiService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.client = (
            genai.Client(api_key=self.settings.gemini_api_key)
            if self.settings.gemini_api_key
            else None
        )

    @property
    def is_configured(self) -> bool:
        return self.client is not None

    async def generate_structured(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        response_model: type[T],
    ) -> T:
        if self.client is None:
            raise RuntimeError("GEMINI_API_KEY is not configured.")

        response = await self.client.aio.models.generate_content(
            model=self.settings.gemini_model,
            contents=user_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=response_model,
                temperature=0.35,
            ),
        )

        payload = self._extract_json(response)
        return response_model.model_validate(payload)

    async def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        enable_search: bool = False,
    ) -> str:
        if self.client is None:
            raise RuntimeError("GEMINI_API_KEY is not configured.")

        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.35,
        )
        if enable_search:
            config.tools = [{"google_search": {}}]

        response = await self.client.aio.models.generate_content(
            model=self.settings.gemini_model,
            contents=user_prompt,
            config=config,
        )
        return getattr(response, "text", "") or ""

    @staticmethod
    def _extract_json(response: Any) -> Any:
        if getattr(response, "parsed", None) is not None:
            return response.parsed

        text = getattr(response, "text", None)
        if not text:
            raise ValueError("Gemini returned an empty response.")

        return json.loads(text)
