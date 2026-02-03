export function evaluateQuestions(answers1: {
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
  question5?: string;
  question6?: string;}, 
  answers2: {
  question1?: string;
  question2?: string;
  question3?: string;
  question4?: string;
  question5?: string;
  question6?: string;
}) {


    let score = 0;

    if (answers1.question1 && answers2.question1 && answers1.question1 === answers2.question1) {
      score += 1;
    }
    if (answers1.question2 && answers2.question2 && answers1.question2 === answers2.question2) {
      score += 1;
    }
    if (answers1.question3 && answers2.question3 && answers1.question3 === answers2.question3) {
      score += 1;
    }
    if (answers1.question4 && answers2.question4 && answers1.question4 === answers2.question4) {
      score += 1;
    }
    if (answers1.question5 && answers2.question5 && answers1.question5 === answers2.question5) {
      score += 1;
    }
    if (answers1.question6 && answers2.question6 && answers1.question6 === answers2.question6) {
      score += 1;
    }

    return score;
  












}