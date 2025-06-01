---
name: Feature Request
description: Suggest an idea for the extension
title: "[Feature]: "
labels: ["enhancement", "feature-request"]
assignees:
  - KevinTCoughlin
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to suggest a new feature!
  - type: checkboxes
    id: existing
    attributes:
      label: Is there an existing feature request for this?
      description: Please search to see if a feature request already exists for your idea.
      options:
        - label: I have searched the existing feature requests
          required: true
  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear and concise description of what the problem is.
      placeholder: I'm always frustrated when...
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Describe the solution you'd like
      description: A clear and concise description of what you want to happen.
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Describe alternatives you've considered
      description: A clear and concise description of any alternative solutions or features you've considered.
  - type: dropdown
    id: complexity
    attributes:
      label: Complexity
      description: How complex do you think this feature would be to implement?
      options:
        - Simple (UI change, configuration option)
        - Medium (New functionality, API changes)
        - Complex (Major feature, architectural changes)
        - Unknown
  - type: textarea
    id: additional
    attributes:
      label: Additional Context
      description: Add any other context, mockups, or screenshots about the feature request here.
  - type: checkboxes
    id: terms
    attributes:
      label: Code of Conduct
      description: By submitting this feature request, you agree to follow our Code of Conduct
      options:
        - label: I agree to follow this project's Code of Conduct
          required: true
---
