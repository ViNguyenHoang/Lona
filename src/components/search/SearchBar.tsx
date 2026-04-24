import { useState } from 'react'
import {
  IconMicrophone,
  IconMicrophoneOff,
  IconSearch,
} from '@tabler/icons-react'
import { useVoice } from '../../hooks/useVoice'

interface SearchProps {
  onSearch: (keyword: string) => void
}

export default function SearchBar({ onSearch }: SearchProps) {
  const [textInput, setTextInput] = useState('')

  const { isListening, transcript, supported, startListening, stopListening } =
    useVoice({
      onResult: (text) => {
        setTextInput(text)
        onSearch(text)
      },
    })

  function handleTextSearch(e: any) {
    e.preventDefault()
    if (textInput.trim()) onSearch(textInput.trim())
  }

  function handleMicClick() {
    if (isListening) stopListening()
    else startListening()
  }

  return (
    <>
      {/* Mic button */}
      <div className="mic-wrap">
        <button
          className={`mic-btn ${isListening ? 'mic--active' : ''}`}
          onClick={handleMicClick}
          aria-label={isListening ? 'Dừng nghe' : 'Bắt đầu nghe'}
        >
          {isListening ? (
            <IconMicrophoneOff size={38} color="#fff" />
          ) : (
            <IconMicrophone size={38} color="#fff" />
          )}
        </button>

        <div className="mic-status">
          {isListening
            ? 'Đang nghe… nói tên sản phẩm'
            : supported
              ? 'Nhấn để tìm kiếm bằng giọng nói'
              : 'Trình duyệt không hỗ trợ – dùng ô tìm bên dưới'}
        </div>

        {/* Realtime transcript */}
        {(isListening || transcript) && (
          <div className="mic-text">{transcript || '…'}</div>
        )}
      </div>

      {/* Text input fallback — luôn hiện để tiện dùng */}
      <div className="search-input-wrap">
        <input
          type="text"
          placeholder="Hoặc gõ tên sản phẩm…"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleTextSearch(e)}
        />
        <button onClick={handleTextSearch}>
          <IconSearch size={16} />
        </button>
      </div>
    </>
  )
}
