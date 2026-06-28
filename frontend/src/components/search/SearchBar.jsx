import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSuggestions, clearSuggestions, setQuery } from '../../store/slices/searchSlice';

const SearchBar = ({ onSearch, placeholder = 'Search for shops, products, or categories...' }) => {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dispatch = useDispatch();
  const { suggestions } = useSelector((state) => state.search);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.trim().length >= 2) {
      debounceTimer.current = setTimeout(() => {
        dispatch(fetchSuggestions(value));
        setShowSuggestions(true);
      }, 300);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      dispatch(setQuery(inputValue.trim()));
      setShowSuggestions(false);
      onSearch(inputValue.trim());
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.text);
    dispatch(setQuery(suggestion.text));
    setShowSuggestions(false);
    onSearch(suggestion.text);
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        dispatch(setQuery(transcript));
        onSearch(transcript);
      };
      recognition.start();
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          {/* Search icon */}
          <div className="pl-3">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={placeholder}
            className="w-full px-3 py-3 text-gray-900 placeholder-gray-500 border-none focus:outline-none focus:ring-0 rounded-lg"
          />

          {/* Voice search button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Voice search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>

          {/* Image search button */}
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            title="Image search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* Search button */}
          <button
            type="submit"
            className="mr-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
              onMouseDown={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.type === 'category' && (
                <span className="text-indigo-500 text-xs font-medium bg-indigo-50 px-2 py-0.5 rounded">Category</span>
              )}
              {suggestion.type === 'shop' && (
                <span className="text-green-500 text-xs font-medium bg-green-50 px-2 py-0.5 rounded">Shop</span>
              )}
              {suggestion.type === 'tag' && (
                <span className="text-orange-500 text-xs font-medium bg-orange-50 px-2 py-0.5 rounded">Tag</span>
              )}
              {suggestion.type === 'keyword' && (
                <span className="text-purple-500 text-xs font-medium bg-purple-50 px-2 py-0.5 rounded">Keyword</span>
              )}
              <span className="text-gray-700">{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
