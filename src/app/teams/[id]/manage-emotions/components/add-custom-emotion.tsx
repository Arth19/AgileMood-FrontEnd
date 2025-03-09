"use client";

import { useState } from "react";
import { useEmotionRecordContext } from "@/contexts/emotion-record-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Componente Label simples
const Label = ({ 
  htmlFor, 
  children, 
  className = "" 
}: { 
  htmlFor?: string; 
  children: React.ReactNode; 
  className?: string;
}) => (
  <label 
    htmlFor={htmlFor} 
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
);

// Lista de emojis populares para escolher
const popularEmojis = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", 
  "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", 
  "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", 
  "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", 
  "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", 
  "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", 
  "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", 
  "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", 
  "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", 
  "👿", "👹", "👺", "🤡", "💩", "👻", "💀", "☠️", "👽", "👾"
];

export default function AddCustomEmotion({ onEmotionAdded }: { onEmotionAdded: () => void }) {
  const { createEmotion } = useEmotionRecordContext();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("😀");
  const [color, setColor] = useState("#4169E1");
  const [isNegative, setIsNegative] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Por favor, insira um nome para a emoção.");
      return;
    }
    
    if (!emoji) {
      toast.error("Por favor, selecione um emoji.");
      return;
    }

    setLoading(true);
    
    try {
      const result = await createEmotion({
        name,
        emoji,
        color,
        is_negative: isNegative
      });
      
      if (result.success) {
        toast.success(`Emoção "${name}" criada com sucesso!`);
        setOpen(false);
        resetForm();
        onEmotionAdded();
      } else {
        toast.error(`Erro ao criar emoção: ${result.error}`);
      }
    } catch (error) {
      console.error("Erro ao criar emoção:", error);
      toast.error("Ocorreu um erro inesperado ao criar a emoção.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmoji("😀");
    setColor("#4169E1");
    setIsNegative(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Adicionar Emoção Personalizada
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Emoção</DialogTitle>
          <DialogDescription>
            Crie uma emoção personalizada para seu time.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Empolgado"
                maxLength={20}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emoji" className="text-right">
                Emoji
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <div 
                  className="w-12 h-12 flex items-center justify-center text-3xl border rounded-md cursor-pointer"
                  onClick={() => document.getElementById("emojiPicker")?.focus()}
                >
                  {emoji}
                </div>
                <Input
                  id="emojiPicker"
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-24"
                  maxLength={2}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2 mt-2">
              <div className="col-span-4">
                <Label className="mb-2 block">Emojis Populares</Label>
                <div className="grid grid-cols-10 gap-1 border rounded-md p-2 max-h-32 overflow-y-auto">
                  {popularEmojis.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setEmoji(e)}
                      className={`text-xl p-1 rounded hover:bg-gray-100 ${
                        emoji === e ? "bg-blue-100 border border-blue-300" : ""
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Cor
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1"
                  placeholder="#RRGGBB"
                  pattern="^#([A-Fa-f0-9]{6})$"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isNegative" className="text-right">
                Emoção Negativa
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isNegative"
                  checked={isNegative}
                  onCheckedChange={setIsNegative}
                />
                <Label htmlFor="isNegative" className="cursor-pointer">
                  {isNegative ? "Sim" : "Não"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Emoção"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 