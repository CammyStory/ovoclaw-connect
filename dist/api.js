function makeError(code, message, extras = {}) {
    const err = new Error(message);
    err.code = code;
    if (extras.status !== undefined)
        err.status = extras.status;
    if (extras.body !== undefined)
        err.body = extras.body;
    return err;
}
function classifyStatus(status, body) {
    if (status === 400)
        return 'invalid_request';
    if (status === 401)
        return 'session_expired';
    if (status === 403)
        return 'blocked_by_owner';
    if (status === 404)
        return 'invalid_invite';
    if (status === 409) {
        const e = body?.error ?? '';
        if (e === 'agent_busy' || e === 'queue_full')
            return 'agent_busy';
        return 'agent_unavailable';
    }
    if (status === 429) {
        return body?.error === 'auth_blocked' ? 'auth_blocked' : 'rate_limited';
    }
    if (status >= 500)
        return 'server_error';
    return 'unknown';
}
async function jsonFetch(url, init) {
    let res;
    try {
        res = await fetch(url, init);
    }
    catch (e) {
        // Network-level failure: fetch threw before any HTTP response.
        // Common in Node: DNS failure, ECONNREFUSED, TLS error, timeout.
        const cause = e.cause;
        const reason = cause?.code || cause?.message || e.message || 'fetch failed';
        throw makeError('network_error', `network_error: ${reason}`);
    }
    const text = await res.text();
    let body;
    try {
        body = text ? JSON.parse(text) : {};
    }
    catch {
        body = { raw: text };
    }
    if (!res.ok) {
        const b = body;
        const code = classifyStatus(res.status, b);
        const msg = b?.message || b?.error || res.statusText;
        throw makeError(code, `${code} (HTTP ${res.status}): ${msg}`, { status: res.status, body });
    }
    return body;
}
export async function getManifest(host, slug) {
    return jsonFetch(`${host}/manifest/${encodeURIComponent(slug)}`, {
        method: 'GET',
    });
}
export async function connect(host, slug, body) {
    return jsonFetch(`${host}/connect/${encodeURIComponent(slug)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}
export async function pollConnect(host, slug, requestId) {
    return jsonFetch(`${host}/connect/${encodeURIComponent(slug)}/poll/${encodeURIComponent(requestId)}`, { method: 'GET' });
}
export async function sendMessage(host, token, content) {
    return jsonFetch(`${host}/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
    });
}
export async function pollReplies(host, token, sinceSeq, waitSeconds = 0) {
    const params = new URLSearchParams({
        since: String(sinceSeq),
        wait: String(waitSeconds),
    });
    return jsonFetch(`${host}/poll?${params.toString()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    });
}
