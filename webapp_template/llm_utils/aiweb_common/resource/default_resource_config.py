# PUBMED Configurables
PUBMED_QUERY_PROMPT = "Given the following research question, suggest a PubMed search string to find relevant articles:\n\n{}. Make the query sufficiently broad to be used to evaluate novelty of the project. Return only the pubmed search string, as your response will be used directly as an input to a function that takes in pubmed search strings."

PUBMED_FEW_RESULTS_PROMPT = "\n\n The following query returned no or few results. Please suggest a simpler one (i.e., with fewer query elements).\n\n"

PUBMED_SYSTEM_PROMPT = "You are an expert at conducting medical literature searches. You help beginning researchers with literature search and review."


# NIH RePORTER Configurables
NIH_INCLUDE_FIELDS = [
    "ContactPiName",
    "Organization",
    "ProjectTitle",
    "AbstractText",
    "PhrText",
]

NIH_DEPARTMENTS = [
    "Anesthesiology",
    "Microbiology/Immun/Virology",
    "Neurosciences",
    "Dentistry",
    "Physiology",
    "Surgery",
]
