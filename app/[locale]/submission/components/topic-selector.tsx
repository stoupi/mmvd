'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import type { Category, MainArea } from '@/app/generated/prisma';

interface TopicSelectorProps {
  categories: (Category & { topics: MainArea[] })[];
  proposalCounts: Record<string, number>;
  fieldName: 'mainAreaId' | 'secondaryTopics';
  label: string;
  excludeTopicId?: string;
  readOnly?: boolean;
}

export function TopicSelector({
  categories,
  proposalCounts,
  fieldName,
  label,
  excludeTopicId,
  readOnly,
}: TopicSelectorProps) {
  const form = useFormContext();
  const currentValue = form.watch(fieldName);
  const isMultiple = fieldName === 'secondaryTopics';
  const selectedTopicIds = Array.isArray(currentValue) ? currentValue : currentValue ? [currentValue] : [];
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  const allTopics = categories.flatMap((category) => category.topics);
  const selectedTopics = selectedTopicIds
    .map((topicId) => allTopics.find((topic) => topic.id === topicId))
    .filter(Boolean) as MainArea[];

  const availableCategories = categories.filter((category) => {
    const availableTopics = category.topics.filter(
      (topic) => topic.id !== excludeTopicId
    );
    return availableTopics.length > 0;
  });

  const handleExpandAll = () => {
    setOpenCategories(availableCategories.map((cat) => cat.code));
  };

  const handleCollapseAll = () => {
    setOpenCategories([]);
  };

  const handleRadioChange = (topicId: string) => {
    form.setValue(fieldName, topicId);
  };

  const handleCheckboxChange = (topicId: string, checked: boolean) => {
    const currentIds = Array.isArray(currentValue) ? currentValue : [];
    if (checked) {
      if (currentIds.length < 2) {
        form.setValue(fieldName, [...currentIds, topicId]);
      }
    } else {
      form.setValue(
        fieldName,
        currentIds.filter((id) => id !== topicId)
      );
    }
  };

  const removeSelection = (topicId: string) => {
    if (isMultiple) {
      const currentIds = Array.isArray(currentValue) ? currentValue : [];
      form.setValue(
        fieldName,
        currentIds.filter((id) => id !== topicId)
      );
    } else {
      form.setValue(fieldName, '');
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-lg font-bold">{label}</Label>
        {!isMultiple && <span className="text-pink-600 ml-1">*</span>}
        {isMultiple && <span className="text-sm text-muted-foreground ml-2">(max 2)</span>}
      </div>

      {selectedTopics.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200">
          {selectedTopics.map((topic) => (
            <Badge
              key={topic.id}
              variant="secondary"
              className="bg-white border border-pink-300 text-pink-900 px-3 py-1.5 text-sm font-medium"
            >
              <span className="font-mono mr-1.5">{topic.code}</span>
              {topic.label}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => removeSelection(topic.id)}
                  className="ml-2 hover:bg-pink-100 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-rose-600">
          Numbers show proposals <strong>already submitted</strong> for this window
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExpandAll}
            className="text-xs h-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="h-3 w-3 mr-1" />
            Expand All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCollapseAll}
            className="text-xs h-7 text-muted-foreground hover:text-foreground"
          >
            <ChevronUp className="h-3 w-3 mr-1" />
            Collapse All
          </Button>
        </div>
      </div>

      <Accordion
        type="multiple"
        value={openCategories}
        onValueChange={setOpenCategories}
        className="w-full border rounded-lg"
      >
        {categories.map((category) => {
          const availableTopics = category.topics.filter(
            (topic) => topic.id !== excludeTopicId
          );

          if (availableTopics.length === 0) return null;

          const categoryHasSelection = availableTopics.some((topic) =>
            selectedTopicIds.includes(topic.id)
          );

          return (
            <AccordionItem key={category.id} value={category.code}>
              <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-pink-600">
                    {category.code}
                  </span>
                  <span className="font-medium text-sm">{category.label}</span>
                  {categoryHasSelection && (
                    <Badge variant="outline" className="ml-2 border-pink-600 text-pink-600 text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-2 pb-3">
                {isMultiple ? (
                  <div className="space-y-2">
                    {availableTopics.map((topic) => {
                      const isChecked = selectedTopicIds.includes(topic.id);
                      const isDisabled =
                        readOnly ||
                        (!isChecked && selectedTopicIds.length >= 2);

                      return (
                        <div
                          key={topic.id}
                          className={`flex items-start space-x-3 p-2 rounded hover:bg-gray-50 ${
                            isChecked ? 'bg-pink-50 border border-pink-200' : ''
                          } ${isDisabled ? 'opacity-50' : ''}`}
                        >
                          <Checkbox
                            id={topic.id}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(topic.id, checked as boolean)
                            }
                            disabled={isDisabled}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={topic.id}
                            className={`flex-1 ${isDisabled ? '' : 'cursor-pointer'}`}
                          >
                            <span className="font-mono text-xs text-gray-600 mr-2">
                              {topic.code}
                            </span>
                            <span className="text-sm">{topic.label}</span>
                            <span className="ml-2 text-pink-600 font-semibold text-xs">
                              ({proposalCounts[topic.id] || 0})
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <RadioGroup
                    value={selectedTopicIds[0] || ''}
                    onValueChange={handleRadioChange}
                    className="space-y-2"
                    disabled={readOnly}
                  >
                    {availableTopics.map((topic) => {
                      const isSelected = selectedTopicIds.includes(topic.id);

                      return (
                        <div
                          key={topic.id}
                          className={`flex items-start space-x-3 p-2 rounded hover:bg-gray-50 ${
                            isSelected ? 'bg-pink-50 border border-pink-200' : ''
                          }`}
                        >
                          <RadioGroupItem
                            value={topic.id}
                            id={topic.id}
                            disabled={readOnly}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={topic.id}
                            className="flex-1 cursor-pointer"
                          >
                            <span className="font-mono text-xs text-gray-600 mr-2">
                              {topic.code}
                            </span>
                            <span className="text-sm">{topic.label}</span>
                            <span className="ml-2 text-pink-600 font-semibold text-xs">
                              ({proposalCounts[topic.id] || 0})
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {form.formState.errors[fieldName] && (
        <p className="text-sm font-medium text-destructive">
          {form.formState.errors[fieldName]?.message as string}
        </p>
      )}
    </div>
  );
}
