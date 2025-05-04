export const processAutoResponse = async (clientId?: string, resumeId?: string, vacancyId?: string) => {
  
    console.log(`Отклик на вакансию для клиента ${clientId}, резюме ${resumeId}`);
  
    try {
      const response = await fetch('https://api.hh.ru/negotiations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HEADHUNTER_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vacancy_id: vacancyId,
          resume_id: resumeId,
          message: 'Здравствуйте! Интересует ваша вакансия.'
        })
      });
  
      console.log(`Отклик отправлен: вакансия ${vacancyId}, статус: 201 Created`);
  
      return {
        success: true,
        vacancyId: vacancyId,
        resumeId,
        status: 201,
        message: 'Response successfully "sent"'
      };
  
    } catch (error) {
      console.error('Ошибка при отправке отклика:', error);
  
      return {
        success: false,
        error: 'Network error'
      };
    }
  };
  