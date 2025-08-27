# Security Policy

## Supported Versions

We actively support the following versions of EquiSight with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The EquiSight team takes security seriously. If you believe you have found a security vulnerability in EquiSight, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to security@your-domain.com. Include the word "SECURITY" in the subject line.

### What to Include

Please include the following information in your report:

* Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

### Response Timeline

We will acknowledge your email within 24 hours, and will send a more detailed response within 48 hours indicating the next steps in handling your report.

After the initial reply to your report, we will endeavor to keep you informed of the progress towards a fix and full announcement, and may ask for additional information or guidance.

## Security Measures

### Infrastructure Security

* **HTTPS Only**: All traffic is encrypted using TLS 1.2+
* **Supabase Security**: Leveraging Supabase's enterprise-grade security
* **Row Level Security**: All database access is protected by RLS policies
* **API Authentication**: All API endpoints require proper authentication
* **CORS Protection**: Proper CORS headers on all endpoints

### Data Protection

* **Encryption at Rest**: All sensitive data is encrypted at rest
* **Encryption in Transit**: All data transmission is encrypted
* **API Key Security**: API keys are stored securely using Supabase secrets
* **Input Sanitization**: All user inputs are sanitized and validated
* **SQL Injection Protection**: Using parameterized queries only

### Application Security

* **Content Security Policy**: Implemented to prevent XSS attacks
* **Authentication**: Secure authentication using Supabase Auth
* **Session Management**: Secure session handling
* **Rate Limiting**: API rate limiting to prevent abuse
* **Error Handling**: Secure error handling that doesn't leak information

### Third-Party Security

* **Dependency Scanning**: Regular dependency vulnerability scanning
* **API Provider Security**: Using reputable financial data providers
* **Update Policy**: Regular updates of dependencies
* **Security Audits**: Regular security audits of third-party integrations

## Security Best Practices for Users

### For Developers

* Keep your local development environment secure
* Never commit API keys or sensitive information
* Use environment variables for all configuration
* Keep dependencies up to date
* Follow secure coding practices

### For Administrators

* Use strong, unique passwords
* Enable two-factor authentication when available
* Regularly review user access and permissions
* Monitor for suspicious activity
* Keep the application updated

## Vulnerability Disclosure Policy

* We ask that you give us a reasonable amount of time to address the issue before any disclosure to the public or a third party
* We will not take legal action against researchers who report vulnerabilities in good faith
* We will acknowledge your contribution in our security acknowledgments (unless you prefer to remain anonymous)

## Security Acknowledgments

We would like to thank the following individuals and organizations for responsibly disclosing security vulnerabilities:

*(None reported yet - be the first!)*

## Security Updates

Security updates will be announced through:

* GitHub Security Advisories
* Release notes with security fixes clearly marked
* Email notifications to registered users (for critical vulnerabilities)

## Contact

For questions about this security policy, contact us at security@your-domain.com.

---

*This security policy is effective as of [Date] and was last updated on [Date].*