
# Git Commenter

**LLM을 연동하여 자동으로 커밋 및 Pull Request 리뷰 코멘트를 생성합니다.**  
OpenAI, Azure OpenAI, Google Gemini 와 연동할 수 있으며, 커스텀 프롬프트를 지원합니다.

---

## Features
- `push` 이벤트 시 커밋에 리뷰 코멘트 자동 작성
- `pull_request` 이벤트 시 PR 리뷰 자동 작성
- LLM Provider 지원: **OpenAI**, **Azure OpenAI**, **Google Gemini**
- 커스텀 프롬프트 지원 (`{{diff}}`, `{{files}}`, `{{commit_message}}` 변수)
- 큰 diff를 **파일 단위/청크 단위로 분할**하여 안정적으로 처리
- **제외 경로 / 확장자 지정 가능** (예: `docs/`, `.md`)

---

## Inputs

| Name              | Required | Description                                                                                  |
|-------------------|----------|----------------------------------------------------------------------------------------------|
| `provider`        | ✅       | LLM provider (`openai`, `azure`, `gemini`)                                                   |
| `model`           | ✅       | 모델 이름 (예: `gpt-4o`, `gpt-4o-mini`, `gemini-pro`)                                         |
| `prompt_template` | ✅       | 프롬프트 템플릿. `{{diff}}`, `{{files}}`, `{{commit_message}}` 변수 지원                     |
| `token`           | ✅       | GitHub Token. **`secrets.TOKEN`** 또는 기본 제공되는 **`secrets.GITHUB_TOKEN`** 을 지정 가능 |
| `openai_api_key`  | ❌       | OpenAI API Key                                                                               |
| `azure_api_key`   | ❌       | Azure OpenAI API Key                                                                         |
| `azure_endpoint`  | ❌       | Azure OpenAI Endpoint URL                                                                    |
| `azure_deployment`| ❌       | Azure OpenAI Deployment 이름                                                                 |
| `azure_api_version`| ❌      | Azure API Version (기본: `2024-04-01-preview`)                                               |
| `gemini_api_key`  | ❌       | Google Gemini API Key                                                                        |
| `exclude_paths`   | ❌       | 제외할 경로 (콤마 구분, 예: `docs/,tests/`)                                                  |
| `exclude_exts`    | ❌       | 제외할 확장자 (콤마 구분, 예: `.md,.txt`)                                                    |

---

## Example Usage

### Azure OpenAI
```yaml
name: Git Commenter

on:
  push:
    branches: [ main ]
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Git Commenter
        uses: KangYoungIn/git-commenter@v1.0.0
        with:
          provider: azure
          model: gpt-4o
          azure_endpoint: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
          azure_api_key: ${{ secrets.AZURE_OPENAI_KEY }}
          azure_deployment: gpt-4o
          azure_api_version: 2024-04-01-preview
          prompt_template: |
            변경된 코드(diff):
            {{diff}}

            분석 지침:
            - 변경 이유 설명
            - 잠재적 리스크 식별
            - 개선사항 제안
          token: ${{ secrets.TOKEN }}
          exclude_paths: "docs/,tests/"
          exclude_exts: ".md,.txt"
````

### OpenAI 

```yaml
- uses: KangYoungIn/git-commenter@v1.0.0
  with:
    provider: openai
    model: gpt-4o-mini
    openai_api_key: ${{ secrets.OPENAI_API_KEY }}
    prompt_template: |
      {{diff}}
    token: ${{ secrets.TOKEN }}
```

### Gemini 

```yaml
- uses: KangYoungIn/git-commenter@v1.0.0
  with:
    provider: gemini
    model: gemini-pro
    gemini_api_key: ${{ secrets.GEMINI_API_KEY }}
    prompt_template: |
      {{diff}}
    token: ${{ secrets.TOKEN }}
```

---

## Notes

* 반드시 `token` input 에 인증 토큰을 전달해야 코멘트 작성 가능
* 기본적으로 GitHub에서 제공하는 `secrets.GITHUB_TOKEN` 을 쓸 수 있으나,
  별도로 `TOKEN` secret 을 등록해서 `token: ${{ secrets.TOKEN }}` 형태로 써도 됩니다.
* diff 크기가 큰 경우 자동으로 파일별/라인별 청크로 나누어 LLM 호출
* `exclude_paths`, `exclude_exts` 로 불필요한 파일 제외 가능