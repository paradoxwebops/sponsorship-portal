"use client";

import {useEffect, useRef, useState} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {CalendarIcon, Plus, Trash, X} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { departments } from "@/app/utils/mockData";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import {Timestamp} from "firebase/firestore";
import { DepartmentUserDropdown } from "../shared/DepartmentUserDropdown";

interface AddTaskFormProps {
    sponsorId: any;
    onSuccess: () => void;
    deliverable?: any;
}
interface DepartmentUser {
    message: string | undefined;
    userId: string;
    userName: string;
    userEmail: string;
}
interface SelectedUserWithMessage extends DepartmentUser {
    message: string;
}

const formSchema = z.object({
    title: z.string().min(2, {
        message: "Task title must be at least 2 characters.",
    }),
    description: z.string().min(10, {
        message: "Description must be at least 10 characters.",
    }),
    taskType: z.enum(["standard", "cost"]),
    dueDate: z.date(),
    proofRequired: z.enum(["image", "document", "video", "other"]),
    // Fields for cost-based tasks
    costType: z.enum(["posters", "standee", "banner", "accommodation", "food"]).optional(),
    paymentType: z.enum(["event", "custom", "common"]).optional(),
    estimatedCost: z.number().min(0).optional(),
});

export function AddTaskForm({ sponsorId, deliverable, onSuccess }: AddTaskFormProps) {
    const [additionalFile, setAdditionalFile] = useState<File | null>(null);

    const [departmentUsers, setDepartmentUsers] = useState<{ userId: string, userName: string, userEmail: string }[]>([]);
    useEffect(() => {
        async function fetchDepartmentUsers() {
            const res = await fetch('/api/users/departments');
            const data = await res.json();
            setDepartmentUsers(data.users);
        }
        fetchDepartmentUsers();
    }, []);

    const [isDepartmentUserLocked, setIsDepartmentUserLocked] = useState(false);

    const handleTaskTypeChange = (value: string) => {
        if (value === 'cost') {
            // Find the department user with email 'fr@iitmparadox.org'
            const foUser = departmentUsers.find(u => u.userEmail === 'fr@iitmparadox.org');

            if (foUser) {
                setSelectedUsers([
                    {
                        userId: foUser.userId,         // from departmentUsers
                        userName: 'FO',                // fixed
                        userEmail: 'fr@iitmparadox.org', // fixed
                        message: 'Add the cost to the following' // fixed
                    }
                ]);
                setIsDepartmentUserLocked(true); // Lock immediately after auto-adding FO
            } else {
                console.error('FO user not found in department users');
                setSelectedUsers([]); // clear safely
            }
        } else {
            setSelectedUsers([]); // clear if not cost
            setIsDepartmentUserLocked(false); // unlock
        }
    };


    const [selectedUsers, setSelectedUsers] = useState<SelectedUserWithMessage[]>([]);
    const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
    const handleAddUser = (user: DepartmentUser | null) => {
        if (isDepartmentUserLocked) return; // ⬅️ Prevent adding if locked

        if (user && !selectedUsers.some(u => u.userId === user.userId)) {
            setSelectedUsers(prev => [...prev, { ...user, message: '' }]);
        }
    };

    const handleMessageTyping = (userId: string, newMessage: string) => {
        if (isDepartmentUserLocked) return; // ⬅️ Prevent typing if locked

        // Update the input immediately so user sees what they type
        setSelectedUsers(prev =>
            prev.map(u => u.userId === userId ? { ...u, message: newMessage } : u)
        );

        // Now debounce a "final update" (optional API sync)
        if (debounceTimers.current[userId]) {
            clearTimeout(debounceTimers.current[userId]);
        }
        debounceTimers.current[userId] = setTimeout(() => {
            console.log(`Debounced message updated for ${userId}: ${newMessage}`);
            // (optional API call or sync action can happen here)
        }, 400);
    };

    const handleRemoveUser = (userId: string) => {
        if (isDepartmentUserLocked) return; // ⬅️ Prevent removal if locked

        setSelectedUsers(prev => prev.filter(u => u.userId !== userId));

        if (debounceTimers.current[userId]) {
            clearTimeout(debounceTimers.current[userId]);
            delete debounceTimers.current[userId];
        }
    };
    const [selectedDepartments, setSelectedDepartments] = useState<
        {
            userId: string;
            userName: string;
            userEmail: string;
            message: string;
        }[]
    >([]);

    // States for cost type specific fields
    const [posterFields, setPosterFields] = useState({ number: 0, size: "small", cost: 0 });
    const [standeeFields, setStandeeFields] = useState({ number: 0, size: "small", cost: 0 });
    const [bannerFields, setBannerFields] = useState({ number: 0, size: "small", cost: 0 });
    const [accommodationPeople, setAccommodationPeople] = useState<
        {
            cost: string | readonly string[] | number | undefined;
            person: string, arrival: string, departure: string, food: boolean }[]
    >([{
        person: "", arrival: "", departure: "", food: false,
        cost: undefined
    }]);
    const [foodMeals, setFoodMeals] = useState<
        { people: number, mealType: string, cost: number }[]
    >([{ people: 0, mealType: "lunch", cost: 0 }]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
         defaultValues: {
           title: deliverable?.title || "",
               description: deliverable?.description || "",
               taskType: deliverable?.taskType || "standard",
               dueDate: deliverable?.dueDate ? new Date(deliverable.dueDate) : new Date(),
               proofRequired: deliverable?.proofRequired || "image",
               costType: deliverable?.costType || undefined,
               paymentType: deliverable?.paymentType || undefined,
               estimatedCost: deliverable?.estimatedCost || 0,
             },
    });
    useEffect(() => {
        if (deliverable) {
            if (deliverable.listDepartments) {
                setSelectedUsers(deliverable.listDepartments);
            }
            if (deliverable.taskType === "cost") {
                if (deliverable.costType === "posters") {
                    setPosterFields({
                        number: deliverable.numberOfPrintable || 0,
                        size: deliverable.sizeOfPrintable || "small",
                        cost: deliverable.costPerPrintable || 0,
                    });
                } else if (deliverable.costType === "standee") {
                    setStandeeFields({
                        number: deliverable.numberOfPrintable || 0,
                        size: deliverable.sizeOfPrintable || "small",
                        cost: deliverable.costPerPrintable || 0,
                    });
                } else if (deliverable.costType === "banner") {
                    setBannerFields({
                        number: deliverable.numberOfPrintable || 0,
                        size: deliverable.sizeOfPrintable || "small",
                        cost: deliverable.costPerPrintable || 0,
                    });
                } else if (deliverable.costType === "accommodation") {
                    setAccommodationPeople(
                        (deliverable.accommodations || []).map((a: any) => ({
                            person: a.personName,
                            arrival: a.arrivalDate,
                            departure: a.departureDate,
                            cost: a.costPerPerson,
                            food: false,
                        }))
                    );
                } else if (deliverable.costType === "food") {
                    setFoodMeals(
                        (deliverable.food || []).map((f: any) => ({
                            people: f.numberOfPeople,
                            mealType: f.mealType,
                            cost: f.costPerPerson,
                        }))
                    );
                }
            }
        }
    }, [deliverable]);

    const taskType = form.watch("taskType");
    const costType = form.watch("costType");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setAdditionalFile(file);
    };



    const handleAddAccommodationPerson = () => {
        setAccommodationPeople([
            ...accommodationPeople,
            {
                person: "", arrival: "", departure: "", food: false,
                cost: undefined
            }
        ]);
    };

    const handleRemoveAccommodationPerson = (index: number) => {
        if (accommodationPeople.length > 1) {
            const newPeople = [...accommodationPeople];
            newPeople.splice(index, 1);
            setAccommodationPeople(newPeople);
        }
    };

    const updateAccommodationPerson = (index: number, field: string, value: any) => {
        const newPeople = [...accommodationPeople];
        newPeople[index] = {
            ...newPeople[index],
            [field]: value
        };
        setAccommodationPeople(newPeople);
    };

    const handleAddMeal = () => {
        setFoodMeals([
            ...foodMeals,
            { people: 0, mealType: "lunch", cost: 0 }
        ]);
    };

    const handleRemoveMeal = (index: number) => {
        if (foodMeals.length > 1) {
            const newMeals = [...foodMeals];
            newMeals.splice(index, 1);
            setFoodMeals(newMeals);
        }
    };

    const updateMealField = (index: number, field: string, value: any) => {
        const newMeals = [...foodMeals];
        newMeals[index] = {
            ...newMeals[index],
            [field]: value
        };
        setFoodMeals(newMeals);
    };

    const getTotalFoodCost = () => {
        return foodMeals.reduce((total, meal) => {
            return total + (meal.people * meal.cost);
        }, 0);
    };
    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const isEditMode = !!deliverable?.id; // Check upfront if it's edit mode

            const newDeliverable: any = {
                sponsorId,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate.toISOString(),
                status: "pending",
                priority: "medium",
                proofRequired: data.proofRequired,
                taskType: data.taskType,
                costType: data.costType,
                paymentType: data.paymentType,
                listDepartments: selectedUsers.map((user) => ({
                    userId: user.userId,
                    userEmail: user.userEmail,
                    userName: user.userName,
                    message: user.message,
                })),
            };

            if (data.taskType === "cost") {
                if (["posters", "standee", "banner"].includes(data.costType || "")) {
                    const fields = data.costType === "posters" ? posterFields
                        : data.costType === "standee" ? standeeFields
                            : bannerFields;

                    newDeliverable.numberOfPrintable = fields.number;
                    newDeliverable.sizeOfPrintable = fields.size;
                    newDeliverable.costPerPrintable = fields.cost;
                    newDeliverable.estimatedCost = fields.number * fields.cost;

                } else if (data.costType === "accommodation") {
                    newDeliverable.accommodations = accommodationPeople.map((p) => ({
                        personName: p.person,
                        arrivalDate: p.arrival,
                        departureDate: p.departure,
                        costPerPerson: p.cost,
                    }));

                    newDeliverable.estimatedCost = accommodationPeople.reduce((sum, p) => {
                        const cost = typeof p.cost === "number" ? p.cost : parseFloat(p.cost as string) || 0;
                        return sum + cost;
                    }, 0);

                } else if (data.costType === "food") {
                    newDeliverable.food = foodMeals.map((meal) => ({
                        numberOfPeople: meal.people,
                        mealType: meal.mealType as 'lunch' | 'breakfast' | 'dinner' | 'snacks',
                        costPerPerson: meal.cost,
                    }));

                    newDeliverable.estimatedCost = foodMeals.reduce((sum, meal) => {
                        return sum + (meal.people * meal.cost);
                    }, 0);
                }
            }

            // 🚀 Decide method and URL based on edit mode
            const method = isEditMode ? "PATCH" : "POST";
            const url = isEditMode
                ? `/api/sponsors/${sponsorId}/deliverables/${deliverable.id}`
                : `/api/sponsors/${sponsorId}/deliverables`;

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDeliverable),
            });

            const result = await res.json();

            if (result.success) {
                toast.success(method === "PATCH" ? "Task updated successfully!" : "Task added successfully!");
                onSuccess();
            } else {
                toast.error("Failed to submit task.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while submitting the task.");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <Card className="overflow-hidden border">
                        <div className="bg-muted py-3 px-4 border-b">
                            <FormField
                                control={form.control}
                                name="taskType"
                                render={({ field }) => (
                                    <FormItem className="space-y-0">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-base font-semibold">Task Type</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={(value) => {
                                                        field.onChange(value);         // Update form field (for react-hook-form)
                                                        handleTaskTypeChange(value);   // Update selectedUsers, locking, etc.
                                                    }}
                                                    defaultValue={field.value}
                                                    className="flex space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="standard" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Standard Task</FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <RadioGroupItem value="cost" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">Task with Associated Costs</FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Task Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Logo Placement on Stage" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Detailed description of what needs to be done"
                                                    {...field}
                                                    className="min-h-[120px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Due Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="proofRequired"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Proof Required</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select proof type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="image">Image</SelectItem>
                                                    <SelectItem value="document">Document</SelectItem>
                                                    <SelectItem value="video">Video</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <Label htmlFor="additional-file">Additional Information (Optional)</Label>
                                    <Input
                                        id="additional-file"
                                        type="file"
                                        onChange={handleFileChange}
                                        className="mt-2"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Upload any additional files needed for this task.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <Accordion type="single" collapsible defaultValue="departments" className="w-full">
                                    <AccordionItem value="departments">
                                        <AccordionTrigger className="text-base font-semibold py-2">
                                            Departments
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="p-2 space-y-2">

                                                <DepartmentUserDropdown
                                                    excludeUserIds={selectedUsers.map(u => u.userId)}
                                                    onSelectUserAction={handleAddUser}
                                                />

                                                {selectedUsers.length > 0 && (
                                                    <div className="mt-4 space-y-2">
                                                        {selectedUsers.map((user) => (
                                                            <div key={user.userId}
                                                                 className="relative p-4 border rounded-lg space-y-3">
                                                                {/* Remove Button */}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveUser(user.userId)}
                                                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                                                >
                                                                    <X size={20}/>
                                                                </button>

                                                                {/* User Info */}
                                                                <div>
                                                                    <p><strong>Name:</strong> {user.userName}</p>
                                                                    <p><strong>Email:</strong> {user.userEmail}</p>
                                                                </div>

                                                                {/* Message Input */}
                                                                <div>
                                                                    <label className="block text-sm font-medium mb-1">Message
                                                                        for {user.userName}:</label>
                                                                    <input
                                                                        type="text"
                                                                        value={user.message}
                                                                        onChange={(e) => handleMessageTyping(user.userId, e.target.value)}
                                                                        className="w-full border rounded-md p-2 text-sm"
                                                                        placeholder="Enter a message..."
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>

                                    {/* Cost information for cost-based tasks */}
                                    {taskType === "cost" && (
                                        <AccordionItem value="costs">
                                            <AccordionTrigger className="text-base font-semibold py-2">
                                                Cost Information
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-6">
                                                <p className="text-sm text-muted-foreground">
                                                    This information will be used by Finance to allocate budget.
                                                </p>

                                                <FormField
                                                    control={form.control}
                                                    name="costType"
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>Cost Type</FormLabel>
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                            <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select cost type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="posters">Posters</SelectItem>
                                                                    <SelectItem value="standee">Standee</SelectItem>
                                                                    <SelectItem value="banner">Banner</SelectItem>
                                                                    <SelectItem value="accommodation">Accommodation</SelectItem>
                                                                    <SelectItem value="food">Food</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {costType === "posters" && (
                                                    <div className="space-y-4 border rounded-lg p-4">
                                                        <h4 className="font-medium">Poster Details</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <Label htmlFor="poster-number">Number of Posters</Label>
                                                                <Input
                                                                    id="poster-number"
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={posterFields.number}
                                                                    onChange={(e) => setPosterFields({
                                                                        ...posterFields,
                                                                        number: parseInt(e.target.value) || 0
                                                                    })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="poster-size">Size</Label>
                                                                <Select
                                                                    value={posterFields.size}
                                                                    onValueChange={(value) => setPosterFields({
                                                                        ...posterFields,
                                                                        size: value
                                                                    })}
                                                                >
                                                                    <SelectTrigger id="poster-size">
                                                                        <SelectValue placeholder="Select size" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="small">Small (A4)</SelectItem>
                                                                        <SelectItem value="medium">Medium (A3)</SelectItem>
                                                                        <SelectItem value="large">Large (A2)</SelectItem>
                                                                        <SelectItem value="xlarge">Extra Large (A1)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="poster-cost">Cost per Poster ($)</Label>
                                                                <Input
                                                                    id="poster-cost"
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={posterFields.cost}
                                                                    onChange={(e) => setPosterFields({
                                                                        ...posterFields,
                                                                        cost: parseInt(e.target.value) || 0
                                                                    })}
                                                                    readOnly
                                                                    className="bg-muted"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label>Total Cost</Label>
                                                            <Input
                                                                readOnly
                                                                value={`$${(posterFields.number * posterFields.cost).toFixed(2)}`}
                                                                className="bg-muted"
                                                            />
                                                        </div>

                                                        <FormField
                                                            control={form.control}
                                                            name="paymentType"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel>Payment Type</FormLabel>
                                                                    <FormControl>
                                                                        <RadioGroup
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value}
                                                                            className="flex flex-col space-y-1"
                                                                        >
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="event" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Event-Based (First Person Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="custom" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Custom (Sponsor Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="common" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Common (First Person Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        </RadioGroup>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                {costType === "standee" && (
                                                    <div className="space-y-4 border rounded-lg p-4">
                                                        <h4 className="font-medium">Standee Details</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <Label htmlFor="standee-number">Number of Standees</Label>
                                                                <Input
                                                                    id="standee-number"
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={standeeFields.number}
                                                                    onChange={(e) => setStandeeFields({
                                                                        ...standeeFields,
                                                                        number: parseInt(e.target.value) || 0
                                                                    })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="standee-size">Size</Label>
                                                                <Select
                                                                    value={standeeFields.size}
                                                                    onValueChange={(value) => setStandeeFields({
                                                                        ...standeeFields,
                                                                        size: value
                                                                    })}
                                                                >
                                                                    <SelectTrigger id="standee-size">
                                                                        <SelectValue placeholder="Select size" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="small">Small</SelectItem>
                                                                        <SelectItem value="medium">Medium</SelectItem>
                                                                        <SelectItem value="large">Large</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="standee-cost">Cost per Standee ($)</Label>
                                                                <Input
                                                                    id="standee-cost"
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={standeeFields.cost}
                                                                    onChange={(e) => setStandeeFields({
                                                                        ...standeeFields,
                                                                        cost: parseInt(e.target.value) || 0
                                                                    })}
                                                                    readOnly
                                                                    className="bg-muted"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label>Total Cost</Label>
                                                            <Input
                                                                readOnly
                                                                value={`$${(standeeFields.number * standeeFields.cost).toFixed(2)}`}
                                                                className="bg-muted"
                                                            />
                                                        </div>

                                                        <FormField
                                                            control={form.control}
                                                            name="paymentType"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel>Payment Type</FormLabel>
                                                                    <FormControl>
                                                                        <RadioGroup
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value}
                                                                            className="flex flex-col space-y-1"
                                                                        >
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="event" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Event-Based (First Person Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="custom" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Custom (Sponsor Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="common" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Common (First Person Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        </RadioGroup>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                {costType === "banner" && (
                                                    <div className="space-y-4 border rounded-lg p-4">
                                                        <h4 className="font-medium">Banner Details</h4>
                                                        <div className="grid grid-cols-3 gap-4">
                                                            <div>
                                                                <Label htmlFor="banner-number">Number of Banners</Label>
                                                                <Input
                                                                    id="banner-number"
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={bannerFields.number}
                                                                    onChange={(e) => setBannerFields({
                                                                        ...bannerFields,
                                                                        number: parseInt(e.target.value) || 0
                                                                    })}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="banner-size">Size</Label>
                                                                <Select
                                                                    value={bannerFields.size}
                                                                    onValueChange={(value) => setBannerFields({
                                                                        ...bannerFields,
                                                                        size: value
                                                                    })}
                                                                >
                                                                    <SelectTrigger id="banner-size">
                                                                        <SelectValue placeholder="Select size" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="small">Small (3x2ft)</SelectItem>
                                                                        <SelectItem value="medium">Medium (5x3ft)</SelectItem>
                                                                        <SelectItem value="large">Large (8x4ft)</SelectItem>
                                                                        <SelectItem value="xlarge">Extra Large (10x5ft)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div>
                                                                <Label htmlFor="banner-cost">Cost per Banner ($)</Label>
                                                                <Input
                                                                    id="banner-cost"
                                                                    type="number"
                                                                    placeholder="0"
                                                                    value={bannerFields.cost}
                                                                    onChange={(e) => setBannerFields({
                                                                        ...bannerFields,
                                                                        cost: parseInt(e.target.value) || 0
                                                                    })}
                                                                    readOnly
                                                                    className="bg-muted"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Label>Total Cost</Label>
                                                            <Input
                                                                readOnly
                                                                value={`$${(bannerFields.number * bannerFields.cost).toFixed(2)}`}
                                                                className="bg-muted"
                                                            />
                                                        </div>

                                                        <FormField
                                                            control={form.control}
                                                            name="paymentType"
                                                            render={({ field }) => (
                                                                <FormItem className="space-y-3">
                                                                    <FormLabel>Payment Type</FormLabel>
                                                                    <FormControl>
                                                                        <RadioGroup
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value}
                                                                            className="flex flex-col space-y-1"
                                                                        >
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="event" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Event-Based (First Person Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="custom" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Custom (Sponsor Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                            <FormItem className="flex items-center space-x-3 space-y-0">
                                                                                <FormControl>
                                                                                    <RadioGroupItem value="common" />
                                                                                </FormControl>
                                                                                <FormLabel className="font-normal">
                                                                                    Common (First Person Pays)
                                                                                </FormLabel>
                                                                            </FormItem>
                                                                        </RadioGroup>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                )}

                                                {costType === "accommodation" && (
                                                    <div className="space-y-4 border rounded-lg p-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="font-medium">Accommodation Details</h4>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleAddAccommodationPerson}
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" /> Add Person
                                                            </Button>
                                                        </div>

                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Person</TableHead>
                                                                    <TableHead>Arrival Date</TableHead>
                                                                    <TableHead>Departure Date</TableHead>
                                                                    <TableHead>Cost per Person ($)</TableHead>
                                                                    <TableHead></TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {accommodationPeople.map((person, index) => (
                                                                    <TableRow key={index}>
                                                                        <TableCell>
                                                                            <Input
                                                                                value={person.person}
                                                                                onChange={(e) => updateAccommodationPerson(index, 'person', e.target.value)}
                                                                                placeholder="Name"
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Input
                                                                                type="date"
                                                                                value={person.arrival}
                                                                                onChange={(e) => updateAccommodationPerson(index, 'arrival', e.target.value)}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Input
                                                                                type="date"
                                                                                value={person.departure}
                                                                                onChange={(e) => updateAccommodationPerson(index, 'departure', e.target.value)}
                                                                            />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                                <Input
                                                                                    type="number"
                                                                                    placeholder="0"
                                                                                    value={person.cost}
                                                                                    onChange={(e) => updateAccommodationPerson(index, 'cost', e.target.value)}
                                                                                    readOnly
                                                                                    className="bg-muted"
                                                                                />
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleRemoveAccommodationPerson(index)}
                                                                                disabled={accommodationPeople.length === 1}
                                                                            >
                                                                                <Trash
                                                                                    className="h-4 w-4 text-destructive"/>
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>

                                                        <p className="text-sm text-muted-foreground">
                                                            Food is included/required for those with accommodation
                                                        </p>
                                                    </div>
                                                )}

                                                {costType === "food" && (
                                                    <div className="space-y-4 border rounded-lg p-4">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h4 className="font-medium">Food Details</h4>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={handleAddMeal}
                                                            >
                                                                <Plus className="mr-2 h-4 w-4" /> Add Meal
                                                            </Button>
                                                        </div>

                                                        {foodMeals.map((meal, index) => (
                                                            <div key={index} className="border rounded p-3 space-y-3">
                                                                <div className="flex justify-between items-center">
                                                                    <h5 className="font-medium">Meal {index + 1}</h5>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleRemoveMeal(index)}
                                                                        disabled={foodMeals.length === 1}
                                                                    >
                                                                        <Trash className="h-4 w-4 text-destructive" />
                                                                    </Button>
                                                                </div>
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div>
                                                                        <Label htmlFor={`meal-${index}-people`}>Number of People</Label>
                                                                        <Input
                                                                            id={`meal-${index}-people`}
                                                                            type="number"
                                                                            placeholder="0"
                                                                            value={meal.people}
                                                                            onChange={(e) => updateMealField(index, 'people', parseInt(e.target.value) || 0)}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor={`meal-${index}-type`}>Meal Type</Label>
                                                                        <Select
                                                                            value={meal.mealType}
                                                                            onValueChange={(value) => updateMealField(index, 'mealType', value)}
                                                                        >
                                                                            <SelectTrigger id={`meal-${index}-type`}>
                                                                                <SelectValue placeholder="Select meal" />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                <SelectItem value="breakfast">Breakfast</SelectItem>
                                                                                <SelectItem value="lunch">Lunch</SelectItem>
                                                                                <SelectItem value="dinner">Dinner</SelectItem>
                                                                                <SelectItem value="snacks">Snacks</SelectItem>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>
                                                                    <div>
                                                                        <Label htmlFor={`meal-${index}-cost`}>Cost per Person ($)</Label>
                                                                        <Input
                                                                            id={`meal-${index}-cost`}
                                                                            type="number"
                                                                            placeholder="0"
                                                                            value={meal.cost}
                                                                            onChange={(e) => updateMealField(index, 'cost', parseInt(e.target.value) || 0)}
                                                                            readOnly
                                                                            className="bg-muted"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <Label>Subtotal</Label>
                                                                    <Input
                                                                        readOnly
                                                                        value={`$${(meal.people * meal.cost).toFixed(2)}`}
                                                                        className="bg-muted"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}

                                                        <div>
                                                            <Label>Total Food Cost</Label>
                                                            <Input
                                                                readOnly
                                                                value={`$${getTotalFoodCost().toFixed(2)}`}
                                                                className="bg-muted font-semibold"
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {costType === "accommodation" && (
                                                <FormField
                                                    control={form.control}
                                                    name="estimatedCost"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Total Estimated Cost ($)</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="number"
                                                                    placeholder="0"
                                                                    {...field}
                                                                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                                                    readOnly
                                                                    className="bg-muted"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                )}

                                            </AccordionContent>
                                        </AccordionItem>
                                    )}
                                </Accordion>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                        Cancel
                    </Button>
                    <Button type="submit">{deliverable ? "Update Task" : "Add Task"}</Button>
                </div>
            </form>
        </Form>
    );
}
