import { useState, useRef, useEffect } from 'react'

interface UseVoiceOptions {
  onResult?: (text: string) => void
  onError?: (error: string) => void
}

interface UseVoiceReturn {
  isListening: boolean
  transcript: string
  supported: boolean
  startListening: () => void
  stopListening: () => void
}

export function useVoice({
  onResult,
  onError,
}: UseVoiceOptions = {}): UseVoiceReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [supported] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition ?? window.webkitSpeechRecognition),
  )
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition

    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'vi-VN'
    recognition.interimResults = true
    recognition.maxAlternatives = 1
    recognition.continuous = false

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.results[event.resultIndex]
      const text = current[0].transcript
      setTranscript(text)
      if (current.isFinal) {
        onResult?.(text)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        onError?.(event.error)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognitionRef.current?.abort()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function startListening(): void {
    if (!supported || isListening) return
    setTranscript('')
    recognitionRef.current?.start()
    setIsListening(true)
  }

  function stopListening(): void {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  return {
    isListening,
    transcript,
    supported,
    startListening,
    stopListening,
  }
}
