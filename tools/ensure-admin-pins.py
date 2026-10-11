#!/usr/bin/env python3
"""Ensure Admin portal pins exist in index.html. Safe for End-User pin updates."""
import re, pathlib, sys

# Current working pins (do not revert to ancient SHAs)
ADMIN_LOCK = '9a17dcda7cbe5a9ad3f9af120b4135532b149a13'
SIDEBAR_PROFILE = '545afd29cbaede602653f78631d8c97ce7558683'
SIDEBAR_ROLE = 'cf85fe34e66bb092edf09e521e0ef0879071354a'
USERS_NAV = 'b6f328bf2f2e29c4ab6d88de2fc416c79e4bb070'
THEME = 'bef23962c979e19d937950b628f10649f3f10b2f'
TOPBAR = 'c49dd3bd4b8cd07fa3608633c3d096ce1ac5db04'
DASH = 'e1b64444ddb0dbeea9ec05d05cf843032414c738'
PENDING = '94a5aeaaa38fafaaa1ac94872341ce3bf992dfd1'
LOGIN_CHROME = '60c3368efd15da0e8d15cac0674b28eaed22d973'
FORCE_LIGHT = 'ebcbb4637a65511602a399006a8ccc29f346ecfa'
HB = 'a9046e485443b24e800a4f4d10747c10146ca663'
SHELL = 'abdc47355c0342744e79b8545458cd7d729f93d1'

INDEX = pathlib.Path('index.html')
if not INDEX.exists():
    print('no index.html'); sys.exit(0)
text = INDEX.read_text(encoding='utf-8')

# Slim emergency bootloaders that load a self-contained shell are OK
if "SHELL_SHA = 'abdc473" in text or 'abdc47355c0342744e79b8545458cd7d729f93d1' in text:
    # Only ensure ADMIN_LOCK_SHA is current if the var exists
    if re.search(r"var ADMIN_LOCK_SHA = '[^']*';", text):
        text2 = re.sub(r"var ADMIN_LOCK_SHA = '[^']*';", f"var ADMIN_LOCK_SHA = '{ADMIN_LOCK}';", text)
        text2 = re.sub(r"var SHELL_SHA = '[^']*';", f"var SHELL_SHA = '{SHELL}';", text2)
        if text2 != text:
            INDEX.write_text(text2, encoding='utf-8')
            print('Updated lock/shell pins on slim bootloader')
        else:
            print('Slim bootloader pins already correct')
    else:
        print('Slim bootloader OK')
    sys.exit(0)

def has_good_pins(t):
    return (
        ADMIN_LOCK in t
        and 'admin-portal-lock.js' in t
    )

if has_good_pins(text):
    print('Admin pins already correct')
    sys.exit(0)

print('Admin pins missing or stale — patching index.html')

replacements = [
    (r"var ADMIN_LOCK_SHA = '[^']*';", f"var ADMIN_LOCK_SHA = '{ADMIN_LOCK}';"),
    (r"var SHELL_SHA = '[^']*';", f"var SHELL_SHA = '{SHELL}';"),
    (r"var SIDEBAR_ROLE_SHA = '[^']*';", f"var SIDEBAR_ROLE_SHA = '{SIDEBAR_ROLE}';"),
    (r"var USERS_NAV_SHA = '[^']*';", f"var USERS_NAV_SHA = '{USERS_NAV}';"),
    (r"var THEME_SHA = '[^']*';", f"var THEME_SHA = '{THEME}';"),
    (r"var TOPBAR_SHA = '[^']*';", f"var TOPBAR_SHA = '{TOPBAR}';"),
    (r"var DASH_NO_TICKETS_SHA = '[^']*';", f"var DASH_NO_TICKETS_SHA = '{DASH}';"),
    (r"var PENDING_FIX_SHA = '[^']*';", f"var PENDING_FIX_SHA = '{PENDING}';"),
    (r"var LOGIN_CHROME_HIDE_SHA = '[^']*';", f"var LOGIN_CHROME_HIDE_SHA = '{LOGIN_CHROME}';"),
    (r"var FORCE_LIGHT_BG_SHA = '[^']*';", f"var FORCE_LIGHT_BG_SHA = '{FORCE_LIGHT}';"),
    (r"var HB_SHA = '[^']*';", f"var HB_SHA = '{HB}';"),
]
for pat, rep in replacements:
    if re.search(pat, text):
        text = re.sub(pat, rep, text)

INDEX.write_text(text, encoding='utf-8')
print('Patched index.html with current Admin pins')
