export interface BaseFormProps {
  cvId: string;
  onValidationChange: (isValid: boolean) => void;
  initialData?: any;
}

export interface PersonalInfoFormProps extends BaseFormProps {
  initialData?: PersonalInfo;
}

export interface ExperienceFormProps extends BaseFormProps {
  initialData?: Experience[];
}

// ... diğer form tipleri 