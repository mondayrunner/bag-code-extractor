import { DOMParser } from "xmldom";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const useXmlValidator = () => {
  const validatePostcode = (postcode: string | null): boolean => {
    if (!postcode) return false;
    return /^\d{4}[A-Z]{2}$/.test(postcode);
  };

  const validateHuisnummer = (huisnummer: string | null): boolean => {
    if (!huisnummer) return false;
    return /^\d+[a-zA-Z]*$/.test(huisnummer);
  };

  const validateGuid = (guid: string | null): boolean => {
    if (!guid) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      guid
    );
  };

  const validateXml = (xmlString: string): ValidationResult => {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    try {
      // Basic XML parsing validation
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "text/xml");

      // Check for parse errors
      const parseErrors = xmlDoc.getElementsByTagName("parsererror");
      if (parseErrors.length > 0) {
        result.isValid = false;
        result.errors.push(`XML parse error: ${parseErrors[0].textContent}`);
        return result;
      }

      // Validate required root elements
      const rootElement = xmlDoc.documentElement;
      if (!rootElement) {
        result.isValid = false;
        result.errors.push("XML document has no root element");
        return result;
      }

      // Validate required elements
      const requiredElements = ["Adresgegevens", "RegistratiegegevensInvoer"];
      for (const elementName of requiredElements) {
        const elements = xmlDoc.getElementsByTagName(elementName);
        if (elements.length === 0) {
          result.isValid = false;
          result.errors.push(`Vereist element '${elementName}' ontbreekt`);
        } else if (elements.length > 1) {
          result.warnings.push(
            `Element '${elementName}' komt meerdere keren voor`
          );
        }
      }

      // Validate Adresgegevens structure
      const adresgegevens = xmlDoc.getElementsByTagName("Adresgegevens")[0];
      if (adresgegevens) {
        const requiredAdresFields = [
          "Straat",
          "Huisnummer",
          "Postcode",
          "Woonplaats",
        ];
        for (const fieldName of requiredAdresFields) {
          const field = adresgegevens.getElementsByTagName(fieldName)[0];
          if (!field || !field.textContent) {
            result.isValid = false;
            result.errors.push(
              `Vereist veld '${fieldName}' in Adresgegevens ontbreekt of is leeg`
            );
          } else {
            // Additional field-specific validation
            if (
              fieldName === "Postcode" &&
              !validatePostcode(field.textContent)
            ) {
              result.isValid = false;
              result.errors.push(
                "Postcode formaat is ongeldig (moet 4 cijfers en 2 letters zijn)"
              );
            }
            if (
              fieldName === "Huisnummer" &&
              !validateHuisnummer(field.textContent)
            ) {
              result.isValid = false;
              result.errors.push(
                "Huisnummer formaat is ongeldig (moet beginnen met cijfers, optioneel gevolgd door letters)"
              );
            }
            if (fieldName === "Woonplaats" && field.textContent.length < 2) {
              result.warnings.push("Woonplaats lijkt erg kort");
            }
          }
        }
      }

      // Validate RegistratiegegevensInvoer structure
      const registratiegegevens = xmlDoc.getElementsByTagName(
        "RegistratiegegevensInvoer"
      )[0];
      if (registratiegegevens) {
        // Check RepresentatieveWoningen value
        const repWoningen = registratiegegevens.getElementsByTagName(
          "RepresentatieveWoningen"
        )[0];
        if (repWoningen) {
          const value = repWoningen.textContent;
          if (value !== "0" && value !== "1") {
            result.isValid = false;
            result.errors.push("RepresentatieveWoningen moet 0 of 1 zijn");
          }
        } else {
          result.isValid = false;
          result.errors.push("RepresentatieveWoningen element ontbreekt");
        }

        // Validate ObjectRegistratieRepresentatiefLijstInvoer if present
        const objRegList = registratiegegevens.getElementsByTagName(
          "ObjectRegistratieRepresentatiefLijstInvoer"
        )[0];
        if (objRegList) {
          // Check if Index attribute exists and is valid
          const indexAttr = objRegList.getAttribute("Index");
          if (!indexAttr) {
            result.isValid = false;
            result.errors.push(
              "ObjectRegistratieRepresentatiefLijstInvoer mist Index attribuut"
            );
          } else if (!/^-?\d+$/.test(indexAttr)) {
            result.isValid = false;
            result.errors.push("Index attribuut moet een geheel getal zijn");
          }

          // Validate GUID
          const guid = objRegList.getElementsByTagName("Guid")[0];
          if (!guid || !guid.textContent) {
            result.isValid = false;
            result.errors.push(
              "Guid ontbreekt of is leeg in ObjectRegistratieRepresentatiefLijstInvoer"
            );
          } else if (!validateGuid(guid.textContent)) {
            result.isValid = false;
            result.errors.push("Guid formaat is ongeldig");
          }

          // Validate reference objects if RepresentatieveWoningen is 1
          const repWoningenValue = repWoningen?.textContent;
          const refObjects = objRegList.getElementsByTagName(
            "ObjectRegistratieRepresentatiefInvoer"
          );
          if (repWoningenValue === "1" && refObjects.length === 0) {
            result.isValid = false;
            result.errors.push(
              "RepresentatieveWoningen is 1 maar er zijn geen referentie-objecten gevonden"
            );
          }

          // Validate each reference object
          Array.from(refObjects).forEach((refObject, index) => {
            const refIndex = refObject.getAttribute("Index");
            if (!refIndex || !/^\d+$/.test(refIndex)) {
              result.isValid = false;
              result.errors.push(
                `Referentie-object ${
                  index + 1
                } heeft een ongeldig Index attribuut`
              );
            }

            const requiredRefFields = ["Huisnummer", "Postcode"];

            requiredRefFields.forEach((fieldName) => {
              const field = refObject.getElementsByTagName(fieldName)[0];
              if (!field || !field.textContent) {
                result.isValid = false;
                result.errors.push(
                  `Vereist veld '${fieldName}' ontbreekt in referentie-object ${
                    index + 1
                  }`
                );
              } else if (
                fieldName === "Postcode" &&
                !validatePostcode(field.textContent)
              ) {
                result.isValid = false;
                result.errors.push(
                  `Ongeldig postcode formaat in referentie-object ${index + 1}`
                );
              }
            });
          });
        } else if (repWoningen?.textContent === "1") {
          result.isValid = false;
          result.errors.push(
            "RepresentatieveWoningen is 1 maar ObjectRegistratieRepresentatiefLijstInvoer ontbreekt"
          );
        }
      }
    } catch (error) {
      result.isValid = false;
      result.errors.push(
        `XML validatie fout: ${
          error instanceof Error ? error.message : "Onbekende fout"
        }`
      );
    }

    return result;
  };

  return {
    validateXml,
  };
};
