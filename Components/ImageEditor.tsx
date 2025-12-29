
import React, { useState } from 'react';
import { Camera, Sparkles, Upload, Wand2, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';

const ImageEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setEditedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    try {
      const base64Data = image.split(',')[1];
      const result = await geminiService.editImage(base64Data, prompt);
      if (result) {
        setEditedImage(result);
      }
    } catch (error) {
      alert("Failed to edit image. Ensure your API key is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">AI Visuals</h1>
          <p className="text-sky-600">Generate and edit food photography with Gemini AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-sky-100 flex flex-col items-center justify-center min-h-[400px]">
          {!image ? (
            <div className="text-center">
              <div className="bg-sky-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Camera size={40} className="text-sky-500" />
              </div>
              <h3 className="text-xl font-bold text-sky-900 mb-2">Upload Original Photo</h3>
              <p className="text-sky-500 mb-6 max-w-xs mx-auto">Upload a photo of your dish or drink to apply AI magic.</p>
              <label className="bg-sky-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-200 cursor-pointer transition-all">
                Choose Image
                <input type="file" className="hidden" accept="image/*" onChange={handleUpload} />
              </label>
            </div>
          ) : (
            <div className="w-full relative group">
              <img src={image} alt="Original" className="w-full h-auto rounded-2xl shadow-xl" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="absolute bottom-4 left-4 bg-sky-900/60 backdrop-blur text-white px-3 py-1 rounded-lg text-sm font-medium">
                Original Input
              </div>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-sky-100 flex flex-col items-center justify-center min-h-[400px]">
          {!editedImage ? (
            <div className="text-center w-full">
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Loader2 size={64} className="text-sky-600 animate-spin mb-4" />
                    <Sparkles className="absolute -top-1 -right-1 text-yellow-400 animate-bounce" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-sky-900 mb-2">Gemini is thinking...</h3>
                  <p className="text-sky-500">Applying your creative vision to the dish.</p>
                </div>
              ) : (
                <>
                  <div className="bg-sky-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Wand2 size={40} className="text-sky-500" />
                  </div>
                  <h3 className="text-xl font-bold text-sky-900 mb-2">AI Enhancement</h3>
                  <p className="text-sky-500 mb-6 max-w-xs mx-auto">Describe the changes you want (e.g., "Add a vintage rustic filter", "Make it look more appetizing").</p>
                  
                  <div className="w-full max-w-md mx-auto space-y-4">
                    <textarea
                      disabled={!image}
                      className="w-full p-4 border border-sky-200 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none h-24 disabled:bg-sky-50 disabled:cursor-not-allowed"
                      placeholder="E.g. Add some garnish on top and make the lighting warmer..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                    <button 
                      onClick={handleEdit}
                      disabled={!image || !prompt || loading}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:from-sky-700 hover:to-indigo-700 shadow-xl shadow-sky-200 disabled:opacity-50 transition-all"
                    >
                      <Sparkles size={20} /> Generate AI Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full relative animate-in fade-in duration-700">
              <img src={editedImage} alt="AI Edited" className="w-full h-auto rounded-2xl shadow-xl" />
              <div className="absolute top-4 left-4 bg-yellow-400 text-sky-900 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-1 shadow-lg">
                <Sparkles size={14} /> AI Edited
              </div>
              <div className="mt-6 flex gap-4 w-full">
                <button 
                  onClick={() => setEditedImage(null)}
                  className="flex-1 flex items-center justify-center gap-2 bg-sky-100 text-sky-700 py-3 rounded-xl font-bold hover:bg-sky-200 transition-all"
                >
                  <RefreshCw size={18} /> Re-edit
                </button>
                <a 
                  href={editedImage} 
                  download="majhi_ai_visual.png"
                  className="flex-1 flex items-center justify-center gap-2 bg-sky-900 text-white py-3 rounded-xl font-bold hover:bg-sky-950 transition-all"
                >
                  <Upload size={18} className="rotate-180" /> Save Photo
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
