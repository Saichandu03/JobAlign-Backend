const dreamRoleSchema = require("../models/dreamRoleSchema");
const dreamCompanySchema = require("../models/dreamComanySchema");
const companySchema = require("../models/companySchema");
const rolesSchema = require("../models/rolesSchema");
const Together = require("together-ai");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { parse } = require("dotenv");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

// function parseJson(content) {
//   const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
//   const match = content.match(jsonRegex);

//   if (!match) {
//     console.warn("No JSON block found in the content.");
//     return null;
//   }

//   const jsonString = match[1].trim();

//   try {
//     return JSON.parse(jsonString);
//   } catch (error) {
//     console.error("Failed to parse JSON:", error);
//     return null;
//   }
// }

// const generateSkillRoadmap = async (role) => {
//   const prompt = `

// "Generate a comprehensive, industry-standard skill roadmap for a professional \"${role}\", structured from beginner to expert level. The response must be a pure JSON object, adhering to the following strict requirements:

// 1. Skill Separation: List exactly 8 distinct, globally recognized skills essential for the role. Do not merge disparate skills (e.g., \"HTML\" and \"CSS\" must be separate). Sub-skills are only grouped if they constitute a recognized industry standard (e.g., \"React\" within a broader \"Frontend Frameworks\" skill).

// 2. Topics Per Skill: Each skill must contain 8-10 highly relevant, job-critical topics. These topics must be meticulously ordered, progressing logically from foundational concepts to advanced, expert-level knowledge.

// 3. Topic Structure: Every topic must be an object with three keys:
//     - \"topicName\": A concise, standard, and widely used title (e.g., \"Flexbox Layout\", not \"Advanced Flexbox Layout Techniques Explained\").
//     - \"description\": A brief 1-2 line summary, focusing on the practical application or core understanding of the topic.
//     - \"completed\": false (default boolean value, always).
//     - \"score\": null (default null value, always).

// 4. Content Rules:
//     - Prioritize topics that are most crucial for a professional \"{{role}}\}\" in the current job market, emphasizing practical utility and real-world applicability.
//     - For 'Testing & Debugging', include only the most essential and commonly used tools (e.g., Jest, React Testing Library, browser DevTools); avoid overly specific or niche tools.
//     - Ensure absolute uniqueness of topics; if a concept is covered under one skill (e.g., \"Asynchronous JS\" under JavaScript), it must not reappear under another (e.g., 'APIs').
//     - Focus on core competencies and established technologies; refrain from including experimental or rapidly changing technologies unless they are clearly becoming industry standards.

// Output Format:
// The entire response must be a pure JSON object, without any additional text, markdown formatting (other than for the JSON itself), comments, or apologies.

// Example JSON Structure (for internal reference, actual content varies based on {{role}}):
// {
//   \"{{role}}\": [
//     {
//       \"skill\": \"HTML\",
//       \"topics\": [
//         {
//           \"topicName\": \"Semantic HTML\",
//           \"description\": \"Using HTML5 tags for meaningful structure.\",
//           \"completed\": false,
//           \"score\": null
//         },
//         // ... more topics
//       ]
//     },
//     {
//       \"skill\": \"CSS\",
//       \"topics\": [
//         {
//           \"topicName\": \"Flexbox\",
//           \"description\": \"Creating one-dimensional layouts.\",
//           \"completed\": false,
//           \"score\": null
//         },
//         // ... more topics
//       ]
//     }
//     // ... more skills
//   ]
// }"
//       `;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const analysisText = response.text();

//     const jsonRoleObject = parseJson(analysisText);
//     return jsonRoleObject;
//   } catch (error) {
//     console.error("Error generating skill roadmap:", error);
//     throw new Error(`Failed to generate roadmap for role: ${role}`);
//   }
// };

// const generateCompanyDetails = async (company) => {
//   const prompt = `You are a professional data researcher specializing in company information for career platforms. Your task is to create a comprehensive, accurate JSON object for "${company}" with this exact structure:

// {
//   "name": "Full official company name",
//   "logo": "Working, high-resolution logo URL (must be publicly accessible)",
//   "overview": "Professional 60-80 word summary covering founding year, founders, headquarters, core business, key innovations, career culture, global presence, and job seeker appeal",
//   "topRoles": ["5 most common roles (prioritize technical roles like SDE, Network Engineer, Cloud Architect, Cybersecurity Analyst, Product Manager)"],
//   "locations": ["At most 5 major office locations worldwide with '(HQ)' marking headquarters"]
// }

// CRITICAL REQUIREMENTS:
// 1. The 'logo' field MUST be dynamically generated using the format https://logo.clearbit.com/{domain}, where {domain} is the primary domain. Ensure this URL is functional and points to a high-resolution logo.
// 2. Validate all other information (overview, topRoles, locations) through at least 3 reliable sources.
// 3. Prioritize career-relevant details for job seekers.
// 4. Maintain a professional yet motivational tone.
// 5. Return ONLY valid JSON with no additional text or explanations.

// QUALITY STANDARDS:
// - The 'logo' URL must be a direct image link (PNG/JPG) generated from the Clearbit API format.
// - The 'overview' must include all specified elements.
// - 'locations' must be specific office cities, not regions.

// RETURN ONLY THE JSON OBJECT. DO NOT INCLUDE ANY OTHER TEXT OR MARKDOWN.`;

//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const analysisText = response.text();
//     const jsonRoleObject = parseJson(analysisText);
//     return jsonRoleObject;
//   } catch (error) {
//     console.error("Error generating skill roadmap:", error);
//     throw new Error(`Failed to generate roadmap for role: ${role}`);
//   }
// };

// const addDreamRole = async (req, res) => {
//   try {
//     const { userId, company, role } = req.body;

//     if (!userId || !company || !role) {
//       return res.status(400).json({
//         message:
//           "Missing required fields: userId, company, and role are required",
//       });
//     }

//     const dreamCompany = company.trim().toUpperCase();
//     const dreamRole = role.trim().toUpperCase();

//     const existingRole = await rolesSchema.findOne({ name: dreamRole });

//     if (existingRole) {
//       try {
//         const parsedData = JSON.parse(existingRole.data);
//         return res.status(200).json(parsedData);
//       } catch (parseError) {
//         console.error("Error parsing existing role data:", parseError);
//       }
//     }

//     const companyDetails = await generateCompanyDetails(dreamCompany);
//     const skillRoadmap = await generateSkillRoadmap(dreamRole);

//     const newcompany = new companiesSchema({
//       name: dreamCompany,
//       data: JSON.stringify(companyDetails),
//     });

//     await newcompany.save();

//     const saveCompanyDetails = new dreamCompanySchema(companyDetails);
//     await saveCompanyDetails.save();

//     const newRole = new rolesSchema({
//       name: dreamRole,
//       data: JSON.stringify(skillRoadmap),
//     });

//     await newRole.save();

//     const saveDreamRole = new dreamRoleSchema({
//       userId: userId,
//       dreamRole: dreamRole,
//       skills: skillRoadmap,
//     });
//     await saveDreamRole.save();
//     return res
//       .status(201)
//       .json({ company: companyDetails, role: skillRoadmap });
//   } catch (error) {
//     console.error("Error in addDreamRole:", error);
//     return res.status(500).json({
//       message: "Internal server error while processing dream role",
//       error: error.message,
//     });
//   }
// };

const parseJson = (content) => {
  const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = content.match(jsonRegex);

  if (!match) {
    console.warn("No JSON block found in the content.");
    return null;
  }

  const jsonString = match[1].trim();

  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return null;
  }
};

const generateSkillRoadmap = async (role) => {
  const prompt = `
Generate a comprehensive, industry-standard skill roadmap for a professional "${role}", structured from beginner to expert level. The response must be a pure JSON object, adhering to the following strict requirements:

1. Skill Separation: List exactly 8 distinct, globally recognized skills essential for the role. Do not merge disparate skills (e.g., "HTML" and "CSS" must be separate). Sub-skills are only grouped if they constitute a recognized industry standard (e.g., "React" within a broader "Frontend Frameworks" skill).

2. Topics Per Skill: Each skill must contain 8-10 highly relevant, job-critical topics. These topics must be meticulously ordered, progressing logically from foundational concepts to advanced, expert-level knowledge.

3. Topic Structure: Every topic must be an object with three keys:
    - "topicName": A concise, standard, and widely used title (e.g., "Flexbox Layout", not "Advanced Flexbox Layout Techniques Explained").
    - "description": A brief 1-2 line summary, focusing on the practical application or core understanding of the topic.
    - "completed": false (default boolean value, always).
    - "score": null (default null value, always).

4. Content Rules:
    - Prioritize topics that are most crucial for a professional "${role}" in the current job market, emphasizing practical utility and real-world applicability.
    - For 'Testing & Debugging', include only the most essential and commonly used tools (e.g., Jest, React Testing Library, browser DevTools); avoid overly specific or niche tools.
    - Ensure absolute uniqueness of topics; if a concept is covered under one skill (e.g., "Asynchronous JS" under JavaScript), it must not reappear under another (e.g., 'APIs').
    - Focus on core competencies and established technologies; refrain from including experimental or rapidly changing technologies unless they are clearly becoming industry standards.

Output Format:
The entire response must be a pure JSON object, without any additional text, markdown formatting (other than for the JSON itself), comments, or apologies.

Example JSON Structure (for internal reference, actual content varies based on role):
{
  "${role}": [
    {
      "skill": "HTML",
      "topics": [
        {
          "topicName": "Semantic HTML",
          "description": "Using HTML5 tags for meaningful structure.",
          "completed": false,
          "score": null
        }
      ]
    }
  ]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    const jsonRoleObject = parseJson(analysisText);
    if (!jsonRoleObject) {
      throw new Error("Failed to parse generated skill roadmap JSON");
    }

    return jsonRoleObject;
  } catch (error) {
    console.error(`Error generating skill roadmap for role ${role}:`, error);
    throw new Error(
      `Failed to generate roadmap for role: ${role}. ${error.message}`
    );
  }
};

const generateCompanyDetails = async (company) => {
  const prompt = `You are a professional data researcher specializing in company information for career platforms. Your task is to create a comprehensive, accurate JSON object for "${company}" with this exact structure:

{
  "name": "Full official company name",
  "logo": "Working, high-resolution logo URL (must be publicly accessible)",
  "overview": "Professional 60-80 word summary covering founding year, founders, headquarters, core business, key innovations, career culture, global presence, and job seeker appeal",
  "topRoles": ["5 most common roles (prioritize technical roles like SDE, Network Engineer, Cloud Architect, Cybersecurity Analyst, Product Manager)"],
  "locations": ["At most 5 major office locations worldwide with '(HQ)' marking headquarters"]
}

CRITICAL REQUIREMENTS:
1. The 'logo' field MUST be dynamically generated using the format https://logo.clearbit.com/{domain}, where {domain} is the primary domain. Ensure this URL is functional and points to a high-resolution logo.
2. Validate all other information (overview, topRoles, locations) through at least 3 reliable sources.
3. Prioritize career-relevant details for job seekers.
4. Maintain a professional yet motivational tone.
5. Return ONLY valid JSON with no additional text or explanations.

QUALITY STANDARDS:
- The 'logo' URL must be a direct image link (PNG/JPG) generated from the Clearbit API format.
- The 'overview' must include all specified elements.
- 'locations' must be specific office cities, not regions.

RETURN ONLY THE JSON OBJECT. DO NOT INCLUDE ANY OTHER TEXT OR MARKDOWN.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();

    const jsonCompanyObject = parseJson(analysisText);
    if (!jsonCompanyObject) {
      throw new Error("Failed to parse generated company details JSON");
    }

    return jsonCompanyObject;
  } catch (error) {
    console.error(`Error generating company details for ${company}:`, error);
    throw new Error(
      `Failed to generate company details for: ${company}. ${error.message}`
    );
  }
};

const checkExistingData = async (dreamCompany, dreamRole) => {
  try {
    const [existingCompany, existingRole] = await Promise.all([
      companySchema.findOne({ name: dreamCompany }),
      rolesSchema.findOne({ name: dreamRole }),
    ]);

    let companyData = null;
    let roleData = null;

    if (existingCompany) {
      try {
        companyData = JSON.parse(existingCompany.data);
      } catch (parseError) {
        console.warn(
          `Error parsing existing company data for ${dreamCompany}:`,
          parseError
        );
      }
    }

    if (existingRole) {
      try {
        roleData = JSON.parse(existingRole.data);
      } catch (parseError) {
        console.warn(
          `Error parsing existing role data for ${dreamRole}:`,
          parseError
        );
      }
    }

    return {
      company: companyData,
      role: roleData,
      hasCompany: !!companyData,
      hasRole: !!roleData,
    };
  } catch (error) {
    console.error("Error checking existing data:", error);
    return {
      company: null,
      role: null,
      hasCompany: false,
      hasRole: false,
    };
  }
};

const generateMissingData = async (existingData, dreamCompany, dreamRole) => {
  const { hasCompany, hasRole } = existingData;
  const generationTasks = [];

  if (!hasCompany) {
    console.log(`Generating company details for: ${dreamCompany}`);
    generationTasks.push(
      generateCompanyDetails(dreamCompany).catch((error) => {
        console.error(
          `Failed to generate company details for ${dreamCompany}:`,
          error
        );
        return null;
      })
    );
  }

  if (!hasRole) {
    console.log(`Generating skill roadmap for: ${dreamRole}`);
    generationTasks.push(
      generateSkillRoadmap(dreamRole).catch((error) => {
        console.error(
          `Failed to generate skill roadmap for ${dreamRole}:`,
          error
        );
        return null;
      })
    );
  }

  const results = await Promise.all(generationTasks);

  let newCompanyData = null;
  let newRoleData = null;

  let resultIndex = 0;
  if (!hasCompany) {
    newCompanyData = results[resultIndex++];
  }
  if (!hasRole) {
    newRoleData = results[resultIndex++];
  }

  return {
    newCompanyData,
    newRoleData,
  };
};

const saveNewDataToMasterCollections = async (newCompanyData, newRoleData, dreamCompany, dreamRole) => {
  const saveOperations = [];

  try {
    if (newCompanyData) {
      saveOperations.push(
        new companySchema({
          name: dreamCompany,
          data: JSON.stringify(newCompanyData),
        }).save()
      );
    }

    if (newRoleData) {
      saveOperations.push(
        new rolesSchema({
          name: dreamRole,
          data: JSON.stringify(newRoleData),
        }).save()
      );
    }

    if (saveOperations.length > 0) {
      await Promise.all(saveOperations);
      console.log("Successfully saved new data to master collections");
    }
  } 
  catch (error) {
    console.error("Error saving new data to master collections:", error);
    throw new Error(`Master collections save operation failed: ${error.message}`);
  }
};

const saveToDreamCollections = async (companyData, roleData, dreamCompany, dreamRole, userId) => {
  const saveOperations = [];

  try {
    if (companyData) {
      saveOperations.push(
        new dreamCompanySchema({
          userId: userId,
          ...companyData,
        }).save()
      );
    }

    if (roleData) {
      
      let skillsArray = null;
      
      if (Array.isArray(roleData)) {
        skillsArray = roleData;
      } 
      else if (roleData[dreamRole] && Array.isArray(roleData[dreamRole])) {
        skillsArray = roleData[dreamRole];
      } 
      else if (typeof roleData === 'object') {
        const keys = Object.keys(roleData);
        for (const key of keys) {
          if (Array.isArray(roleData[key])) {
            skillsArray = roleData[key];
            break;
          }
        }
      }
      
      if (!Array.isArray(skillsArray)) {
        console.error("Could not find skills array in role data:", roleData);
        throw new Error("Invalid role data structure - expected array of skills");
      }
      
      
      const transformedSkills = skillsArray.map(skillGroup => {
        if (!skillGroup || typeof skillGroup !== 'object') {
          console.error("Invalid skill group:", skillGroup);
          throw new Error("Invalid skill group structure");
        }
        
        return {
          skillName: skillGroup.skill || skillGroup.skillName || 'Unknown Skill',
          description: skillGroup.description || `Essential skill for ${dreamRole}`,
          topics: skillGroup.topics || []
        };
      });

      saveOperations.push(
        new dreamRoleSchema({
          userId: userId,
          dreamRole: dreamRole,
          skills: transformedSkills,
        }).save()
      );
    }

    if (saveOperations.length > 0) {
      await Promise.all(saveOperations);
    }
  } 
  catch (error) {
    console.error("Error saving data to dream collections:", error);
    console.error("Full error details:", error);
    throw new Error(`Dream collections save operation failed: ${error.message}`);
  }
};

const addDreamRole = async (req, res) => {
  try {
    const { userId, company, role } = req.body;

    if (!userId || !company || !role) {
      return res.status(400).json("Missing required fields: userId, company, and role are required");
    }

    const dreamCompany = company.trim().toUpperCase();
    const dreamRole = role.trim().toUpperCase();


    const existingData = await checkExistingData(dreamCompany, dreamRole);

    let finalCompanyData = existingData.company;
    let finalRoleData = existingData.role;

    if (!existingData.hasCompany || !existingData.hasRole) {
      const { newCompanyData, newRoleData } = await generateMissingData(
        existingData, 
        dreamCompany, 
        dreamRole
      );

      if (!existingData.hasCompany && !newCompanyData) {
        return res.status(500).json("Failed to generate company details");
      }

      if (!existingData.hasRole && !newRoleData) {
        return res.status(500).json("Failed to generate role skill roadmap");
      }

      await saveNewDataToMasterCollections(newCompanyData, newRoleData, dreamCompany, dreamRole);

      if (newCompanyData) finalCompanyData = newCompanyData;
      if (newRoleData) finalRoleData = newRoleData;
    }

    await saveToDreamCollections(finalCompanyData, finalRoleData, dreamCompany, dreamRole, userId);

    return res.status(201).json("Dream role created successfully");

  } 
  catch (error) {
    console.error("Error in addDreamRole:", error);
    return res.status(500).json("Internal server error while processing dream role");
  }
};
module.exports = {
  addDreamRole,
};
