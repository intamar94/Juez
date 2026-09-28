const MODEL=process.env.OPENAI_MODEL||'gpt-5.6-luna';
const SYSTEM=`Eres el motor de ingeniería inversa de Acierto, una plataforma de descubrimiento de regalos.

Tu tarea NO es recomendar productos concretos. Transforma una descripción libre sobre una persona en un perfil semántico útil para descubrir regalos.

Reglas:
- No inventes hechos. Si algo no aparece o no se puede inferir con seguridad, déjalo vacío.
- Detecta relación, edad, profesión y especialidad, hobbies, personalidad, entorno, hábitos, estilo, ocasión, emoción buscada, presupuesto, urgencia, restricciones y cosas que conviene evitar.
- Extrae anti_gift_signals: cosas que probablemente no deberían regalarse.
- Extrae latent_gift_opportunities: oportunidades no obvias como experiencias, consumibles, personalización, tiempo compartido, recuerdos, objetos para un contexto específico o humor relacionado con su mundo.
- No conviertas una profesión en un estereotipo.
- Responde exclusivamente con JSON válido siguiendo el esquema.`;

const schema={type:'object',additionalProperties:false,properties:{
summary:{type:'string'},relationship:{type:'string'},age:{type:['number','null']},
age_confidence:{type:'string',enum:['high','medium','low','none']},
professions:{type:'array',items:{type:'string'}},interests:{type:'array',items:{type:'string'}},
skills:{type:'array',items:{type:'string'}},personality:{type:'array',items:{type:'string'}},
environment:{type:'array',items:{type:'string'}},habits:{type:'array',items:{type:'string'}},
style:{type:'array',items:{type:'string'}},occasion:{type:'string'},
emotional_intent:{type:'array',items:{type:'string'}},constraints:{type:'array',items:{type:'string'}},
anti_gift_signals:{type:'array',items:{type:'string'}},latent_gift_opportunities:{type:'array',items:{type:'string'}},
semantic_tags:{type:'array',items:{type:'string'}},confidence:{type:'number'}},
required:['summary','relationship','age','age_confidence','professions','interests','skills','personality','environment','habits','style','occasion','emotional_intent','constraints','anti_gift_signals','latent_gift_opportunities','semantic_tags','confidence']};

export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI_NOT_CONFIGURED'});
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{}); const text=String(body.text||'').trim();
  if(text.length<12||text.length>4000)return res.status(400).json({error:'INVALID_TEXT'});
  const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+process.env.OPENAI_API_KEY},
   body:JSON.stringify({model:MODEL,input:[{role:'system',content:SYSTEM},{role:'user',content:'Descripción de la persona:\n\n'+text}],text:{format:{type:'json_schema',name:'acierto_gift_profile',strict:true,schema}},max_output_tokens:1400})});
  const data=await response.json(); if(!response.ok)return res.status(502).json({error:'AI_UPSTREAM',detail:data?.error?.message||'OpenAI request failed'});
  const profile=JSON.parse(data.output_text); profile.source='ai'; return res.status(200).json(profile);
 }catch(err){console.error('acierto-ai',err);return res.status(500).json({error:'AI_PARSE_FAILED'});}
}