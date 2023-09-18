import common from './common'

function getError(
  action,
  option,
  xhr
) {
  let msg
  if (xhr.response) {
    msg = `${xhr.response.error || xhr.response}`
  } else if (xhr.responseText) {
    msg = `${xhr.responseText}`
  } else {
    msg = `fail to ${option.method} ${action} ${xhr.status}`
  }

  return new Error(msg)
}

function getBody(xhr) {
  const text = xhr.responseText || xhr.response
  if (!text) {
    return text
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export default function (option) {
  const xhr = new XMLHttpRequest()
  const action = option.action

  const formData = new FormData()
  if (option.data) {

    let suffix = ""
    if (option.file.name.lastIndexOf('.') !== -1) {
      suffix = option.file.name.substring(option.file.name.lastIndexOf('.'))
    }

    for (const [key, value] of Object.entries(option.data)) {
      if (Array.isArray(value)) formData.append(key, ...value)
      else if (key === 'key') formData.append(key, value + new Date().getTime() + Math.floor(Math.random() * 1000) + suffix)
      else formData.append(key, value)
    }
  }
  formData.append(option.filename, option.file, option.file.name)

  xhr.addEventListener('error', () => {
    option.onError(getError(action, option, xhr))
  })

  xhr.addEventListener('load', () => {
    if (xhr.status < 200 || xhr.status >= 300) {
      return option.onError(getError(action, option, xhr))
    }
    option.onSuccess(getBody(xhr))
  })

  xhr.open(option.method, action, true)

  if (option.withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true
  }

  const headers = option.headers || {}
  if (headers instanceof Headers) {
    headers.forEach((value, key) => xhr.setRequestHeader(key, value))
  } else {
    for (const [key, value] of Object.entries(headers)) {
      if (common.isEmpty(value)) continue
      xhr.setRequestHeader(key, value)
    }
  }

  xhr.send(formData)
  return xhr
}
