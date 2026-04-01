AGENT RULES

Code Quality

* Always write clean, readable, and modular code.
* Follow SOLID principles.
* Avoid code duplication.

Architecture

* Follow layered architecture.
* Backend must use Controller → Service → Repository pattern.
* Frontend must separate UI, logic, and API services.

Type Safety

* Always use TypeScript types and interfaces.
* Avoid using "any" unless absolutely necessary.

Validation

* Validate all inputs using DTO or schema validation.
* Never trust client-side data.

Security

* Sanitize inputs.
* Use authentication and authorization where required.
* Never expose sensitive data.

Performance

* Avoid unnecessary database queries.
* Optimize API responses.
* Prevent unnecessary frontend re-renders.

Error Handling

* Always implement proper error handling.
* Return consistent API response format.

Project Structure

* Follow modular folder structure.
* Keep files small and focused.

Documentation

* Provide short explanations for architecture decisions.
* Include comments for complex logic only.
