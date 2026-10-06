#!/usr/bin/env python3
"""Ensure Admin portal pins exist in index.html. Safe for End-User pin updates."""
import re, pathlib, sys

# Locked Admin SHAs — quiet / no-flicker versions only
ADMIN_LOCK = 'f2337f5fd0e3db003cf3a829301e0c19ea027213'
SIDEBAR_ROLE = 'e1b64444ddb0dbeea9ec05d05cf843032414c738'
USERS_NAV = '2f3c4bdbe2f06820e0427ce220ece58252b9fc13'
THEME = 'e1b64444ddb0dbeea9ec05d05cf843032414c738'
TOPBAR = 'e1b64444ddb0dbeea9ec05d05cf843032414c738'
DASH = 'e1b64444ddb0dbeea9ec05d05cf843032414c738'
PENDING = '94a5aeaaa38fafaaa1ac94872341ce3bf992dfd1'

INDEX = pathlib.Path('index.html')
if not INDEX.exists():
    print('no index.html'); sys.exit(0)
text = INDEX.read_text(encoding='utf-8')

def has_good_pins(t):
    return (
        ADMIN_LOCK in t and USERS_NAV in t and SIDEBAR_ROLE in t
        and TOPBAR in t and DASH in t and THEME in t
    )

if has_good_pins(text) and 'admin-portal-lock.js' in text:
    print('Admin pins already correct')
    sys.exit(0)

print('Admin pins missing or stale — patching index.html')

replacements = [
    (r"var ADMIN_LOCK_SHA = '[^']*';", f"var ADMIN_LOCK_SHA = '{ADMIN_LOCK}';"),
    (r"var SIDEBAR_ROLE_SHA = '[^']*';", f"var SIDEBAR_ROLE_SHA = '{SIDEBAR_ROLE}';"),
    (r"var USERS_NAV_SHA = '[^']*';", f"var USERS_NAV_SHA = '{USERS_NAV}';"),
    (r"var THEME_SHA = '[^']*';", f"var THEME_SHA = '{THEME}';"),
    (r"var TOPBAR_SHA = '[^']*';", f"var TOPBAR_SHA = '{TOPBAR}';"),
    (r"var DASH_NO_TICKETS_SHA = '[^']*';", f"var DASH_NO_TICKETS_SHA = '{DASH}';"),
    (r"var PENDING_FIX_SHA = '[^']*';", f"var PENDING_FIX_SHA = '{PENDING}';"),
]
for pat, rep in replacements:
    if re.search(pat, text):
        text = re.sub(pat, rep, text)

if 'ADMIN_LOCK_SHA' not in text:
    block = f"""
    /* ===== ADMIN PORTAL LOCKED PINS (auto-protected) ===== */
    var ADMIN_LOCK_SHA = '{ADMIN_LOCK}';
    var SIDEBAR_ROLE_SHA = '{SIDEBAR_ROLE}';
    var USERS_NAV_SHA = '{USERS_NAV}';
    var THEME_SHA = '{THEME}';
    var TOPBAR_SHA = '{TOPBAR}';
    var DASH_NO_TICKETS_SHA = '{DASH}';
    var PENDING_FIX_SHA = '{PENDING}';
"""
    text = re.sub(
        r"(var SIDEBAR_SHA = '[^']*';)",
        r"\1\n" + block,
        text,
        count=1,
    )

if 'admin-portal-lock.js' not in text[:2000]:
    text = text.replace(
        '</head>',
        '  <script src="https://cdn.jsdelivr.net/gh/Lizer-WebCoder/divine-rays-tech-hub@main/js/admin-portal-lock.js"></script>\n</head>',
        1,
    )

for key, var in [
    ("'users-nav.js'", 'USERS_NAV_SHA'),
    ("'sidebar-role-label.js'", 'SIDEBAR_ROLE_SHA'),
    ("'theme.js'", 'THEME_SHA'),
    ("'topbar-brand-role.js'", 'TOPBAR_SHA'),
    ("'dashboard-no-tickets.js'", 'DASH_NO_TICKETS_SHA'),
    ("'admin-portal-lock.js'", 'ADMIN_LOCK_SHA'),
    ("'pending-approved-fix.js'", 'PENDING_FIX_SHA'),
]:
    if f'{key}: {var}' not in text and f"{key}: {var}" not in text:
        text = re.sub(
            r"(var REWRITE = \{)",
            rf"\1\n      {key}: {var},",
            text,
            count=1,
        )

INDEX.write_text(text, encoding='utf-8')
print('Patched index.html with quiet Admin pins')
