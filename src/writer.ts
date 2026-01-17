import * as fs from 'fs';
import { Exam, QuestionType } from './classes';

export class GiftExporter {
    
    public static save(exam: Exam, filePath: string): boolean {
        try {
            // EFO5 - Vérification du nombre de questions (15-20)
            if (!exam.isValid()) {
                console.error("\nErreur: L'examen doit contenir entre 15 et 20 questions pour être exporté.");
                return false;
            }

            // Génération du contenu complet
            const fileContent = exam.questions.map(q => q.toGift()).join('\n\n');

            // Écriture du fichier
            fs.writeFileSync(filePath, fileContent, 'utf-8');
            return true;

        } catch (error) {
            console.error("Erreur lors de la sauvegarde du fichier:", error);
            return false;
        }
    }
    // Feature Issue 9: Export du Corrigé
    public static saveAnswerKey(exam: Exam, filePath: string): boolean {
        try {
            let content = `CORRIGÉ - ${new Date().toLocaleDateString()}\n\n`;
            
            exam.questions.forEach((q, idx) => {
                content += `Q${idx + 1} [${q.type}] : ${q.title}\n`;
                // On cherche les bonnes réponses
                const correct = q.answers.filter(a => a.isCorrect).map(a => a.text).join(' / ');
                
                if (correct) {
                    content += `✅ Réponse : ${correct}\n`;
                } else if (q.type === QuestionType.Matching) {
                    q.answers.forEach(a => content += `🔗 ${a.text} -> ${a.matchText}\n`);
                } else {
                    content += `(Voir copie étudiant)\n`;
                }
                content += '-----------------------------------\n';
            });

            fs.writeFileSync(filePath, content, 'utf-8');
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    }
    
}