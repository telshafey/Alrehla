
import React from 'react';
import { Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import FormField from '../ui/FormField';

interface SupportFormProps {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  subjectOptions: string[];
}

const SupportForm: React.FC<SupportFormProps> = ({ onSubmit, isSubmitting, subjectOptions }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FormField label="الاسم" htmlFor="name">
          <Input type="text" name="name" id="name" required />
        </FormField>
        <FormField label="البريد الإلكتروني" htmlFor="email">
          <Input type="email" name="email" id="email" required />
        </FormField>
      </div>
      <FormField label="الموضوع" htmlFor="subject">
        <Select name="subject" id="subject" required>
          {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </Select>
      </FormField>
      <FormField label="رسالتك" htmlFor="message">
        <Textarea id="message" name="message" rows={5} required />
      </FormField>
      <Button type="submit" loading={isSubmitting} icon={<Send size={18} />} className="w-full">
        {isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
      </Button>
    </form>
  );
};

export default SupportForm;
