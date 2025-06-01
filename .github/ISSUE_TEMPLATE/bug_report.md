name: Bug Report
description: Report a bug to help us improve the extension
title: "[Bug]: "
labels: ["bug", "triage"]
assignees:
  - KevinTCoughlin
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: input
    id: version
    attributes:
      label: Extension Version
      description: What version of the extension are you using?
      placeholder: e.g., 1.4.3
    validations:
      required: true
  - type: dropdown
    id: browser
    attributes:
      label: Browser
      description: Which browser are you using?
      options:
        - Chrome
        - Edge
        - Other Chromium-based browser
    validations:
      required: true
  - type: input
    id: browser-version
    attributes:
      label: Browser Version
      description: What version of your browser are you using?
      placeholder: e.g., Chrome 120.0.6099.109
    validations:
      required: true
  - type: dropdown
    id: os
    attributes:
      label: Operating System
      description: What operating system are you using?
      options:
        - Windows 10
        - Windows 11
        - macOS
        - Linux
        - Other
    validations:
      required: true
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: A clear and concise description of what the bug is.
      placeholder: Tell us what you see!
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: A clear and concise description of what you expected to happen.
    validations:
      required: true
  - type: textarea
    id: reproduce
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior
      placeholder: |
        1. Go to '...'
        2. Click on '....'
        3. See error
    validations:
      required: true
  - type: textarea
    id: logs
    attributes:
      label: Relevant Console Output
      description: Please copy and paste any relevant console output or error messages.
      render: shell
  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context about the problem here.
  - type: checkboxes
    id: terms
    attributes:
      label: Code of Conduct
      description: By submitting this issue, you agree to follow our Code of Conduct
      options:
        - label: I agree to follow this project's Code of Conduct
          required: true
