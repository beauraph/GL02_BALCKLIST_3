// Enum representing the specific Question types supported by GIFT/Moodle
// Derived from the analysis of the GIFT format in the spec [cite: 51, 149-166]
export enum QuestionType {
    MultipleChoice = "MC",
    TrueFalse = "TF",
    ShortAnswer = "SA",     // For Open Cloze / Fill in the blank
    Matching = "MATCH",
    Numerical = "NUM",
    Essay = "ESSAY",
    Description = "DESC"    // Informational text, not a graded question
}

// Represents a category hierarchy (e.g., $course$/top/Gold B2, Unit 3)
export class Category {
    name: string;
    parent: Category | null;

    constructor(name: string, parent: Category | null = null) {
        this.name = name;
        this.parent = parent;
    }

    // Returns the full path of the category
    getPath(): string {
        return this.parent ? `${this.parent.getPath()}/${this.name}` : this.name;
    }
}

// Represents a single answer option (Correct or Incorrect)
// Corresponds to the components needed for 'Bonnes' and 'Mauvaises' [cite: 221-225]
export class AnswerOption {
    text: string;
    isCorrect: boolean;
    feedback: string | null;
    weight: number | null; // Partial credit (e.g., %50%)
    matchText: string | null; // For Matching questions (Left -> Right)

    constructor(text: string, isCorrect: boolean, feedback: string | null = null, weight: number | null = null, matchText: string | null = null) {
        this.text = text;
        this.isCorrect = isCorrect;
        this.feedback = feedback;
        this.weight = weight;
        this.matchText = matchText;
    }
}

// Interface pour les résultats de validation
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

// The main Question entity
// Implements the Abstract Type 'Question' defined in Section 5.3 [cite: 206-208]
export class Question {
    public title: string;
    public text: string;         // 'Enonce' [cite: 217]
    public type: QuestionType;   // 'TypeQuestion' [cite: 220]
    public answers: AnswerOption[];
    public format: string;       // 'moodle', 'html', 'markdown'
    public category: Category | null; // The category this question belongs to

    constructor(title: string, text: string, type: QuestionType, format: string = "moodle", category: Category | null = null) {
        this.title = title;
        this.text = text;
        this.type = type;
        this.answers = [];
        this.format = format;
        this.category = category;
    }
    
    // Convertit la question en format texte GIFT
    toGift(): string {
        let output = "";

        //Export de la catégorie
        if (this.category) {
            output += `$CATEGORY: ${this.category.getPath()}\n\n`;
        }

        // 1. Titre (Optionnel mais recommandé)
        if (this.title) {
            output += `::${this.title}::`;
        }

        // 2. Format (Markdown/HTML/Moodle)
        if (this.format && this.format !== "moodle") {
            output += `[${this.format}]`;
        }

        // 3. Texte de la question
        output += this.text;

        // 4. Réponses
        if (this.type === QuestionType.Description) {
            // Pas de réponses pour une description
            return output;
        }

        output += " {";

        switch (this.type) {
            case QuestionType.TrueFalse:
                // Format: {T} ou {FALSE}
                const isTrue = this.answers[0]?.isCorrect;
                output += isTrue ? "TRUE" : "FALSE";
                break;

            case QuestionType.MultipleChoice:
            case QuestionType.ShortAnswer:
                // MC: { =Bonne ~Mauvaise }
                // SA: { =Bonne1 =Bonne2 }
                this.answers.forEach(ans => {
                    const prefix = ans.isCorrect ? "=" : "~";
                    output += `\n\t${prefix}${ans.text}`;
                    if (ans.feedback) {
                        output += `#${ans.feedback}`;
                    }
                });
                break;

            case QuestionType.Matching:
                // Format: { =Question -> Answer }
                this.answers.forEach(ans => {
                    output += `\n\t=${ans.text} -> ${ans.matchText}`;
                });
                break;

            case QuestionType.Numerical:
                // Format: {#3.14}
                if (this.answers.length > 0) {
                    output += `#${this.answers[0].text}`;
                }
                break;
            
                case QuestionType.Essay:
                break;
        }

        output += "\n}";
        return output;
    }

    // Helper to add answers during parsing
    addAnswer(answer: AnswerOption): void {
        this.answers.push(answer);
    }

    // --- Selectors required by Algebraic Specification [cite: 216-225] ---

    // Returns the question statement
    // Axiom: Enonce(CréerQuestion(...)) = e [cite: 230]
    getEnonce(): string {
        return this.text;
    }

    // Returns the question type
    // Axiom: TypeQuestion(CréerQuestion(...)) = t [cite: 232]
    getTypeQuestion(): QuestionType {
        return this.type;
    }

    // Returns only the correct answers
    // Axiom: Bonnes(CréerQuestion(...)) = c [cite: 234]
    getBonnes(): AnswerOption[] {
        return this.answers.filter(a => a.isCorrect);
    }

    // Returns only the incorrect answers (distractors)
    // Axiom: Mauvaises(CréerQuestion(...)) = w [cite: 237]
    getMauvaises(): AnswerOption[] {
        return this.answers.filter(a => !a.isCorrect);
    }

    // Checks equality between two questions
    // Axiom: Egal(...) = (e1=e2) ^ (t1=t2) ^ (c1=c2) ^ (w1=w2) [cite: 240-241]
    equals(other: Question): boolean {
        return (
            this.text === other.text &&
            this.type === other.type &&
            this.format === other.format &&
            JSON.stringify(this.getBonnes()) === JSON.stringify(other.getBonnes()) &&
            JSON.stringify(this.getMauvaises()) === JSON.stringify(other.getMauvaises())
        );
    }

    // Validation de la qualité de la question
validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Vérifier que le texte n'est pas vide
    if (!this.text || this.text.trim() === '') {
        errors.push('Question text cannot be empty');
    }

    // 2. Validation selon le type de question
    switch (this.type) {
        case QuestionType.MultipleChoice:
            // MC doit avoir au moins 2 réponses
            if (this.answers.length < 2) {
                errors.push('Multiple Choice must have at least 2 answers');
            }
            // MC doit avoir au moins 1 bonne réponse
            const mcCorrect = this.answers.filter(a => a.isCorrect);
            if (mcCorrect.length === 0) {
                errors.push('Multiple Choice must have at least 1 correct answer');
            }
            // Warning : bonnes pratiques (au moins 3 options)
            if (this.answers.length < 3) {
                warnings.push('Multiple Choice should have at least 3 options for better quality');
            }
            // Warning : pas de feedback
            if (this.answers.every(a => !a.feedback)) {
                warnings.push('Consider adding feedback to help students learn');
            }
            break;

        case QuestionType.TrueFalse:
            // TF doit avoir exactement 1 ou 2 réponses
            if (this.answers.length === 0) {
                errors.push('True/False must have an answer defined');
            }
            break;

        case QuestionType.ShortAnswer:
            // SA doit avoir au moins 1 bonne réponse
            const saCorrect = this.answers.filter(a => a.isCorrect);
            if (saCorrect.length === 0) {
                errors.push('Short Answer must have at least 1 correct answer');
            }
            break;

        case QuestionType.Numerical:
            // NUM doit avoir exactement 1 réponse numérique
            if (this.answers.length === 0) {
                errors.push('Numerical question must have an answer');
            } else if (this.answers.length > 1) {
                warnings.push('Numerical question should have only 1 answer');
            }
            // Vérifier que c'est bien un nombre
            const numText = this.answers[0]?.text;
            if (numText && isNaN(Number(numText))) {
                errors.push('Numerical answer must be a valid number');
            }
            break;

        case QuestionType.Matching:
            // MATCH doit avoir au moins 2 paires
            if (this.answers.length < 2) {
                errors.push('Matching question must have at least 2 pairs');
            }
            // Vérifier que toutes les paires ont un matchText
            const invalidPairs = this.answers.filter(a => !a.matchText);
            if (invalidPairs.length > 0) {
                errors.push('All matching pairs must have both left and right sides');
            }
            break;

        case QuestionType.Essay:
        case QuestionType.Description:
            // Pas de validation spécifique pour Essay et Description
            break;
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
}


}

// Represents the Exam (collection of questions)
// Implements 'EnsQuestion' (Ensemble de Questions) [cite: 242-244]
export class Exam {
    public questions: Question[] = [];

    constructor() {
        this.questions = [];
    }

    // 'Ajouter' operation [cite: 248]
    // Includes check for 'Appartient' (Equality check) before adding [cite: 257-258]
    addQuestion(q: Question): boolean {
        if (this.contains(q)) {
            return false; // Duplicate found, do not add
        }
        this.questions.push(q);
        return true;
    }

    // 'Appartient' operation [cite: 249]
    contains(q: Question): boolean {
        return this.questions.some(existingQ => existingQ.equals(q));
    }

    // 'Card' (Cardinality) operation [cite: 250]
    // Used to validate the 15-20 question constraint [cite: 78, 261]
    card(): number {
        return this.questions.length;
    }

    // Check if exam is valid for export
    isValid(): boolean {
    const n = this.questions.length;
    // Examen réglementaire : entre 15 et 20 questions inclus
    return n >= 15 && n <= 20;
    }
    // Feature 2: Calcul du temps estimé
    getEstimatedTime(): number {
        let minutes = 0;
        this.questions.forEach(q => {
            if (q.type === QuestionType.MultipleChoice) minutes += 1.5;
            else if (q.type === QuestionType.Essay) minutes += 15;
            else if (q.type === QuestionType.TrueFalse) minutes += 1;
            else minutes += 2; // Temps par défaut pour les autres types
        });
    return Math.ceil(minutes);
    }
  
}