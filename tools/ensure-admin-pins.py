#!/usr/bin/env python3
"""Ensure Admin portal pins exist in index.html. Safe for End-User pin updates."""
import re, pathlib, sys

INDEX = pathlib.Path('index.html')
if not INDEX.exists():
    print('no index.html'); sys.exit(0)
text = INDEX.read_text(encoding='utf-8')
if 'ADMIN_LOCK_SHA' in text and 'e8d1899f3de59d4c285e2dc8514b27c0657ccc40' in text and 'f87daa9cf712394f08b7c3150b834322e54f1265' in text:
    print('Admin pins already present')
    sys.exit(0)

print('Admin pins missing — patching index.html')

ADMIN_VARS = """
    /* ===== ADMIN PORTAL LOCKED PINS (auto-protected) ===== */
    var ADMIN_LOCK_SHA = 'e8d1899f3de59d4c285e2dc8514b27c0657ccc40';
    var SIDEBAR_ROLE_SHA = '44b94a0ad4abfd721e4b09d03a1eda83670d7a87';
    var USERS_NAV_SHA = 'f87daa9cf712394f08b7c3150b834322e54f1265';
    var THEME_SHA = '7ee0f900415b2bb33aaa4e9b212250814b7068eb';
    var TOPBAR_SHA = '7ee0f900415b2bb33aaa4e9b212250814b7068eb';
    var DASH_NO_TICKETS_SHA = '9cd76a3ce81dad052eb98af306130ca5c8b70032';
    var PENDING_FIX_SHA = '94a5aeaaa38fafaaa1ac94872341ce3bf992dfd1';
"""

replacements = [
    (r"var SIDEBAR_ROLE_SHA = '[^']*';", "var SIDEBAR_ROLE_SHA = '44b94a0ad4abfd721e4b09d03a1eda83670d7a87';"),
    (r"var USERS_NAV_SHA = '[^']*';", "var USERS_NAV_SHA = 'f87daa9cf712394f08b7c3150b834322e54f1265';"),
]
for pat, rep in replacements:
    text = re.sub(pat, rep, text)

if 'ADMIN_LOCK_SHA' not in text:
    text = re.sub(
        r"(var SIDEBAR_SHA = '[^']*';)",
        r"\1\n" + ADMIN_VARS,
        text,
        count=1,
    )

rewrite_entries = [
    ("'users-nav.js'", "USERS_NAV_SHA"),
    ("'sidebar-role-label.js'", "SIDEBAR_ROLE_SHA"),
    ("'theme.js'", "THEME_SHA"),
    ("'topbar-brand-role.js'", "TOPBAR_SHA"),
    ("'dashboard-no-tickets.js'", "DASH_NO_TICKETS_SHA"),
    ("'admin-portal-lock.js'", "ADMIN_LOCK_SHA"),
    ("'pending-approved-fix.js'", "PENDING_FIX_SHA"),
]
for key, var in rewrite_entries:
    if key in text and f"{key}: {var}" not in text and f'{key}: {var}' not in text:
        text = re.sub(
            r"(var REWRITE = \{)",
            rf"\1\n      {key}: {var},",
            text,
            count=1,
        )

EARLY = """
        loadScript(CDN + ADMIN_LOCK_SHA + '/js/admin-portal-lock.js');
        loadScript(CDN + USERS_NAV_SHA + '/js/users-nav.js');
        loadScript(CDN + SIDEBAR_ROLE_SHA + '/js/sidebar-role-label.js');
        loadScript(CDN + TOPBAR_SHA + '/js/topbar-brand-role.js');
        loadScript(CDN + THEME_SHA + '/js/theme.js');
        loadScript(CDN + DASH_NO_TICKETS_SHA + '/js/dashboard-no-tickets.js');
        loadScript(CDN + PENDING_FIX_SHA + '/js/pending-approved-fix.js');
"""
if "admin-portal-lock.js" not in text:
    text = re.sub(
        r"(setTimeout\(function \(\) \{\s*\n\s*loadScript\(CDN \+ LOGIN_TAB_SHA)",
        EARLY + r"\n        loadScript(CDN + LOGIN_TAB_SHA",
        text,
        count=1,
    )

if 'admin-portal-lock.js' not in text[:1200]:
    text = text.replace(
        '</head>',
        '  <script src="https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@main/js/admin-portal-lock.js"></script>\n</head>',
        1,
    )

INDEX.write_text(text, encoding='utf-8')
print('Patched index.html')
