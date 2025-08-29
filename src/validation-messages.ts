// Helper function to replace :attribute with proper capitalization
const replaceAttribute = (template: string, field?: string): string => {
  const fieldName = field || "veld";

  // Replace :Attribute (capitalized)
  const withCapitalized = template.replace(
    /:Attribute/g,
    fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
  );

  // Replace :attribute (lowercase)
  return withCapitalized.replace(/:attribute/g, fieldName.toLowerCase());
};

// Helper function to replace other placeholders
const replacePlaceholders = (
  template: string,
  replacements: Record<string, string | number>,
): string => {
  let result = template;
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(`:${key}`, "g"), String(value));
  });
  return result;
};

export const validation_messages = {
  accepted: (field?: string) =>
    replaceAttribute(":Attribute moet geaccepteerd zijn.", field),

  accepted_if: (field?: string, other?: string, value?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet worden geaccepteerd als :other :value is.",
        field,
      ),
      { other: other || "other", value: value || "value" },
    ),

  active_url: (field?: string) =>
    replaceAttribute(":Attribute is geen geldige URL.", field),

  after: (field?: string, date?: string) =>
    replacePlaceholders(
      replaceAttribute(":Attribute moet een datum na :date zijn.", field),
      { date: date || "date" },
    ),

  after_or_equal: (field?: string, date?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet een datum na of gelijk aan :date zijn.",
        field,
      ),
      { date: date || "date" },
    ),

  alpha: (field?: string) =>
    replaceAttribute(":Attribute mag alleen letters bevatten.", field),

  alpha_dash: (field?: string) =>
    replaceAttribute(
      ":Attribute mag alleen letters, nummers, underscores (_) en streepjes (-) bevatten.",
      field,
    ),

  alpha_num: (field?: string) =>
    replaceAttribute(
      ":Attribute mag alleen letters en nummers bevatten.",
      field,
    ),

  array: (field?: string) =>
    replaceAttribute(
      ":Attribute moet geselecteerde elementen bevatten.",
      field,
    ),

  before: (field?: string, date?: string) =>
    replacePlaceholders(
      replaceAttribute(":Attribute moet een datum voor :date zijn.", field),
      { date: date || "date" },
    ),

  before_or_equal: (field?: string, date?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet een datum voor of gelijk aan :date zijn.",
        field,
      ),
      { date: date || "date" },
    ),

  between: {
    array: (field?: string, min?: number, max?: number) =>
      replacePlaceholders(
        replaceAttribute(
          ":Attribute moet tussen :min en :max items bevatten.",
          field,
        ),
        { min: min || 0, max: max || 100 },
      ),
    file: (field?: string, min?: number, max?: number) =>
      replacePlaceholders(
        replaceAttribute(
          ":Attribute moet tussen :min en :max kilobytes zijn.",
          field,
        ),
        { min: min || 0, max: max || 100 },
      ),
    numeric: (field?: string, min?: number, max?: number) =>
      replacePlaceholders(
        replaceAttribute(":Attribute moet tussen :min en :max zijn.", field),
        { min: min || 0, max: max || 100 },
      ),
    string: (field?: string, min?: number, max?: number) =>
      replacePlaceholders(
        replaceAttribute(
          ":Attribute moet tussen :min en :max karakters zijn.",
          field,
        ),
        { min: min || 0, max: max || 100 },
      ),
  },

  boolean: (field?: string) =>
    replaceAttribute(":Attribute moet ja of nee zijn.", field),

  confirmed: (field?: string) =>
    replaceAttribute(":Attribute bevestiging komt niet overeen.", field),

  current_password: () => "Huidig wachtwoord is onjuist.",

  date: (field?: string) =>
    replaceAttribute(":Attribute moet een datum bevatten.", field),

  date_equals: (field?: string, date?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet een datum gelijk aan :date zijn.",
        field,
      ),
      { date: date || "date" },
    ),

  date_format: (field?: string) =>
    replaceAttribute(
      ":Attribute moet een geldig datum formaat bevatten.",
      field,
    ),

  declined: (field?: string) =>
    replaceAttribute(":attribute moet afgewezen worden.", field),

  declined_if: (field?: string, other?: string, value?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":attribute moet afgewezen worden wanneer :other gelijk is aan :value.",
        field,
      ),
      { other: other || "other", value: value || "value" },
    ),

  different: (field?: string, other?: string) =>
    replacePlaceholders(
      replaceAttribute(":Attribute en :other moeten verschillend zijn.", field),
      { other: other || "other" },
    ),

  digits: (field?: string, digits?: number) =>
    replacePlaceholders(
      replaceAttribute(":Attribute moet bestaan uit :digits cijfers.", field),
      { digits: digits || 0 },
    ),

  digits_between: (field?: string, min?: number, max?: number) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet bestaan uit minimaal :min en maximaal :max cijfers.",
        field,
      ),
      { min: min || 0, max: max || 10 },
    ),

  dimensions: (field?: string) =>
    replaceAttribute(
      ":Attribute heeft geen geldige afmetingen voor afbeeldingen.",
      field,
    ),

  distinct: (field?: string) =>
    replaceAttribute(":Attribute heeft een dubbele waarde.", field),

  email: (field?: string) =>
    replaceAttribute(":Attribute is geen geldig e-mailadres.", field),

  ends_with: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet met één van de volgende waarden eindigen: :values.",
        field,
      ),
      { values: values || "values" },
    ),

  enum: (field?: string) =>
    replaceAttribute("De geselecteerde :attribute is ongeldig.", field),

  exists: (field?: string) =>
    replaceAttribute(":Attribute bestaat niet.", field),

  file: (field?: string) =>
    replaceAttribute(":Attribute moet een bestand zijn.", field),

  filled: (field?: string) =>
    replaceAttribute(":Attribute is verplicht.", field),

  gt: {
    array: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet meer dan :value waardes bevatten.",
          field,
        ),
        { value: value || 0 },
      ),
    file: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet groter zijn dan :value kilobytes.",
          field,
        ),
        { value: value || 0 },
      ),
    numeric: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute("De :attribute moet groter zijn dan :value.", field),
        { value: value || 0 },
      ),
    string: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet meer dan :value tekens bevatten.",
          field,
        ),
        { value: value || 0 },
      ),
  },

  gte: {
    array: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet :value waardes of meer bevatten.",
          field,
        ),
        { value: value || 0 },
      ),
    file: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet groter of gelijk zijn aan :value kilobytes.",
          field,
        ),
        { value: value || 0 },
      ),
    numeric: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet groter of gelijk zijn aan :value.",
          field,
        ),
        { value: value || 0 },
      ),
    string: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet minimaal :value tekens bevatten.",
          field,
        ),
        { value: value || 0 },
      ),
  },

  image: (field?: string) =>
    replaceAttribute(":Attribute moet een afbeelding zijn.", field),

  in: (field?: string) => replaceAttribute(":Attribute is ongeldig.", field),

  in_array: (field?: string, other?: string) =>
    replacePlaceholders(
      replaceAttribute(":Attribute bestaat niet in :other.", field),
      { other: other || "other" },
    ),

  integer: (field?: string) =>
    replaceAttribute(":Attribute moet een getal zijn.", field),

  ip: (field?: string) =>
    replaceAttribute(":Attribute moet een geldig IP-adres zijn.", field),

  ipv4: (field?: string) =>
    replaceAttribute(":Attribute moet een geldig IPv4-adres zijn.", field),

  ipv6: (field?: string) =>
    replaceAttribute(":Attribute moet een geldig IPv6-adres zijn.", field),

  json: (field?: string) =>
    replaceAttribute(":Attribute moet een geldige JSON-string zijn.", field),

  lt: {
    array: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet minder dan :value waardes bevatten.",
          field,
        ),
        { value: value || 0 },
      ),
    file: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet kleiner zijn dan :value kilobytes.",
          field,
        ),
        { value: value || 0 },
      ),
    numeric: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute("De :attribute moet kleiner zijn dan :value.", field),
        { value: value || 0 },
      ),
    string: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet minder dan :value tekens bevatten.",
          field,
        ),
        { value: value || 0 },
      ),
  },

  lte: {
    array: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet :value waardes of minder bevatten.",
          field,
        ),
        { value: value || 0 },
      ),
    file: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet kleiner of gelijk zijn aan :value kilobytes.",
          field,
        ),
        { value: value || 0 },
      ),
    numeric: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet kleiner of gelijk zijn aan :value.",
          field,
        ),
        { value: value || 0 },
      ),
    string: (field?: string, value?: number) =>
      replacePlaceholders(
        replaceAttribute(
          "De :attribute moet maximaal :value tekens bevatten.",
          field,
        ),
        { value: value || 0 },
      ),
  },

  mac_address: (field?: string) =>
    replaceAttribute("De :attribute moet een geldig MAC-adres zijn.", field),

  max: {
    array: (field?: string, max?: number) =>
      replacePlaceholders(
        replaceAttribute(
          ":Attribute mag niet meer dan :max items bevatten.",
          field,
        ),
        { max: max || 100 },
      ),
    file: (field?: string, max?: number) =>
      replacePlaceholders(
        replaceAttribute(
          ":Attribute mag niet meer dan :max kilobytes zijn.",
          field,
        ),
        { max: max || 100 },
      ),
    numeric: (field?: string, max?: number) =>
      replacePlaceholders(
        replaceAttribute(":Attribute mag niet hoger dan :max zijn.", field),
        { max: max || 100 },
      ),
    string: (field?: string, max?: number) =>
      replacePlaceholders(
        replaceAttribute(
          ":Attribute mag niet uit meer dan :max tekens bestaan.",
          field,
        ),
        { max: max || 100 },
      ),
  },

  mimes: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet een bestand zijn van het bestandstype :values.",
        field,
      ),
      { values: values || "values" },
    ),

  mimetypes: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet een bestand zijn van het bestandstype :values.",
        field,
      ),
      { values: values || "values" },
    ),

  min: {
    array: (field?: string, min?: number) =>
      replacePlaceholders(
        replaceAttribute(
          ":Attribute moet minimaal :min items bevatten.",
          field,
        ),
        { min: min || 1 },
      ),
    file: (field?: string, min?: number) =>
      replacePlaceholders(
        replaceAttribute(
          ":Attribute moet minimaal :min kilobytes zijn.",
          field,
        ),
        { min: min || 1 },
      ),
    numeric: (field?: string, min?: number) =>
      replacePlaceholders(
        replaceAttribute(":Attribute moet minimaal :min zijn.", field),
        { min: min || 1 },
      ),
    string: (field?: string, min?: number) =>
      replacePlaceholders(
        replaceAttribute(":Attribute moet minimaal :min tekens zijn.", field),
        { min: min || 1 },
      ),
  },

  multiple_of: (field?: string, value?: number) =>
    replacePlaceholders(
      replaceAttribute(":Attribute moet een veelvoud van :value zijn.", field),
      { value: value || 1 },
    ),

  not_in: (field?: string) =>
    replaceAttribute("Het formaat van :attribute is ongeldig.", field),

  not_regex: (field?: string) =>
    replaceAttribute("De :attribute formaat is ongeldig.", field),

  numeric: (field?: string) =>
    replaceAttribute(":Attribute moet een nummer zijn.", field),

  password: () => "Wachtwoord is onjuist.",

  present: (field?: string) =>
    replaceAttribute(":Attribute moet bestaan.", field),

  prohibited: (field?: string) =>
    replaceAttribute(":Attribute veld is verboden.", field),

  prohibited_if: (field?: string, other?: string, value?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute veld is verboden indien :other gelijk is aan :value.",
        field,
      ),
      { other: other || "other", value: value || "value" },
    ),

  prohibited_unless: (field?: string, other?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute veld is verboden tenzij :other gelijk is aan :values.",
        field,
      ),
      { other: other || "other", values: values || "values" },
    ),

  prohibits: (field?: string, other?: string) =>
    replacePlaceholders(
      replaceAttribute(
        "Het veld :attribute verbiedt de aanwezigheid van :other.",
        field,
      ),
      { other: other || "other" },
    ),

  regex: (field?: string) =>
    replaceAttribute(":Attribute formaat is ongeldig.", field),

  required: (field?: string) =>
    replaceAttribute(":Attribute is verplicht.", field),

  required_array_keys: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        "The :attribute field must contain entries for: :values.",
        field,
      ),
      { values: values || "values" },
    ),

  required_if: (field?: string, other?: string, value?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute is verplicht indien :other gelijk is aan :value.",
        field,
      ),
      { other: other || "other", value: value || "value" },
    ),

  required_unless: (field?: string, other?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute is verplicht tenzij :other gelijk is aan :values.",
        field,
      ),
      { other: other || "other", values: values || "values" },
    ),

  required_with: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(":Attribute is verplicht i.c.m. :values", field),
      { values: values || "values" },
    ),

  required_with_all: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(":Attribute is verplicht i.c.m. :values", field),
      { values: values || "values" },
    ),

  required_without: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute is verplicht als :values niet ingevuld is.",
        field,
      ),
      { values: values || "values" },
    ),

  required_without_all: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute is verplicht als :values niet ingevuld zijn.",
        field,
      ),
      { values: values || "values" },
    ),

  same: (field?: string, other?: string) =>
    replacePlaceholders(
      replaceAttribute(":Attribute en :other moeten overeenkomen.", field),
      { other: other || "other" },
    ),

  size: {
    array: (field?: string, size?: number) =>
      replacePlaceholders(
        replaceAttribute(":Attribute moet :size items bevatten.", field),
        { size: size || 1 },
      ),
    file: (field?: string, size?: number) =>
      replacePlaceholders(
        replaceAttribute(":Attribute moet :size kilobyte zijn.", field),
        { size: size || 1 },
      ),
    numeric: (field?: string, size?: number) =>
      replacePlaceholders(
        replaceAttribute(":Attribute moet :size zijn.", field),
        { size: size || 1 },
      ),
    string: (field?: string, size?: number) =>
      replacePlaceholders(
        replaceAttribute(":Attribute moet :size tekens zijn.", field),
        { size: size || 1 },
      ),
  },

  starts_with: (field?: string, values?: string) =>
    replacePlaceholders(
      replaceAttribute(
        ":Attribute moet starten met een van de volgende: :values.",
        field,
      ),
      { values: values || "values" },
    ),

  string: (field?: string) =>
    replaceAttribute(":Attribute moet een tekst zijn.", field),

  timezone: (field?: string) =>
    replaceAttribute(":Attribute moet een geldige tijdzone zijn.", field),

  unique: (field?: string) =>
    replaceAttribute(":Attribute is al in gebruik.", field),

  uploaded: (field?: string) =>
    replaceAttribute("Het uploaden van :attribute is mislukt.", field),

  url: (field?: string) =>
    replaceAttribute(":Attribute moet een geldig URL zijn.", field),

  uuid: (field?: string) =>
    replaceAttribute(":Attribute moet een geldig UUID zijn.", field),
};

// Usage examples:
// messages.required() // "Veld is verplicht."
// messages.required('Naam') // "Naam is verplicht."
// messages.email('E-mailadres') // "E-mailadres is geen geldig e-mailadres."
// messages.min.string('Wachtwoord', 8) // "Wachtwoord moet minimaal 8 tekens zijn."
export default validation_messages;
