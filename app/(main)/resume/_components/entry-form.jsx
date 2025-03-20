// app/resume/_components/entry-form.jsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { entrySchema } from "@/app/lib/schema";
import { Sparkles, PlusCircle, X, Pencil, Save, Loader2 } from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = parse(dateString, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

export function EntryForm({ type, entries, onChange }) {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });

  const current = watch("current");

  const handleAdd = handleValidation((data) => {
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current ? "" : formatDisplayDate(data.endDate),
    };

    onChange([...entries, formattedEntry]);

    reset();
    setIsAdding(false);
  });

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  // Add this effect to handle the improvement result
  useEffect(() => {
    if (improvedContent && !isImproving) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve description");
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  // Replace handleImproveDescription with this
  const handleImproveDescription = async () => {
    const description = watch("description");
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(), // 'experience', 'education', or 'project'
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title} @ {item.organization}
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={() => handleDelete(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {item.current
                  ? `${item.startDate} - Present`
                  : `${item.startDate} - ${item.endDate}`}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>Add {type}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {type === "Experience" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Job Title/Position <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Job Title/Position"
                    {...register("title")}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 animate-pulse">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Company <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Company"
                    {...register("organization")}
                    className={errors.organization ? "border-red-500" : ""}
                  />
                  {errors.organization && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {errors.organization.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {type === "Education" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Degree/Certification <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Degree/Certification"
                    {...register("title")}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 animate-pulse">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Institution/University <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Institution/University"
                    {...register("organization")}
                    className={errors.organization ? "border-red-500" : ""}
                  />
                  {errors.organization && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {errors.organization.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {type === "Project" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Project Name"
                    {...register("title")}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 animate-pulse">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Technologies Used <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Technologies Used"
                    {...register("organization")}
                    className={errors.organization ? "border-red-500" : ""}
                  />
                  {errors.organization && (
                    <p className="text-sm text-red-500 animate-pulse">
                      {errors.organization.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="month"
                  {...register("startDate")}
                  className={errors.startDate ? "border-red-500" : ""}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 animate-pulse">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  End Date {!current && <span className="text-red-500">*</span>}
                </label>
                <Input
                  type="month"
                  {...register("endDate")}
                  disabled={current}
                  className={errors.endDate ? "border-red-500" : ""}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 animate-pulse">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="current"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                  }
                }}
              />
              <label htmlFor="current">
                {type === "Experience" 
                  ? "Current Job"
                  : type === "Education"
                  ? "Currently Studying"
                  : "Ongoing Project"}
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder={`Description of your ${type.toLowerCase()} (minimum 10 characters)`}
                className={`h-32 ${errors.description ? "border-red-500" : ""}`}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-red-500 animate-pulse">{errors.description.message}</p>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImproveDescription}
              disabled={isImproving || !watch("description")}
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve with AI
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setIsAdding(false);
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAdd}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
}
