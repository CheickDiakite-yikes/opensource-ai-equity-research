
// Implement growth catalysts generator to support both types
export const generateGrowthCatalysts = (catalysts: any): string => {
  if (!catalysts) return '';
  
  // Handle string array format (legacy)
  if (Array.isArray(catalysts)) {
    let html = `
      <div class="report-section">
        <h3>Key Growth Catalysts</h3>
        <ul>
    `;
    
    catalysts.forEach(catalyst => {
      html += `<li>${catalyst}</li>`;
    });
    
    html += `
        </ul>
      </div>
    `;
    
    return html;
  }
  
  // Handle GrowthCatalysts object format
  let html = '<div class="report-section">';
  
  // Positive catalysts
  if (catalysts.positive && catalysts.positive.length > 0) {
    html += `
      <h3>Positive Growth Catalysts</h3>
      <ul>
    `;
    
    catalysts.positive.forEach((catalyst: string) => {
      html += `<li>${catalyst}</li>`;
    });
    
    html += '</ul>';
  }
  
  // Negative catalysts
  if (catalysts.negative && catalysts.negative.length > 0) {
    html += `
      <h3>Risk Factors</h3>
      <ul>
    `;
    
    catalysts.negative.forEach((catalyst: string) => {
      html += `<li>${catalyst}</li>`;
    });
    
    html += '</ul>';
  }
  
  // Timeline
  if (catalysts.timeline) {
    html += '<h3>Catalyst Timeline</h3>';
    
    // Short-term
    if (catalysts.timeline.shortTerm && catalysts.timeline.shortTerm.length > 0) {
      html += `
        <h4>Short-term</h4>
        <ul>
      `;
      
      catalysts.timeline.shortTerm.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      
      html += '</ul>';
    }
    
    // Medium-term
    if (catalysts.timeline.mediumTerm && catalysts.timeline.mediumTerm.length > 0) {
      html += `
        <h4>Medium-term</h4>
        <ul>
      `;
      
      catalysts.timeline.mediumTerm.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      
      html += '</ul>';
    }
    
    // Long-term
    if (catalysts.timeline.longTerm && catalysts.timeline.longTerm.length > 0) {
      html += `
        <h4>Long-term</h4>
        <ul>
      `;
      
      catalysts.timeline.longTerm.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      
      html += '</ul>';
    }
  }
  
  html += '</div>';
  
  return html;
};

// Export the function for use in other files
export {
  generateGrowthCatalysts
};
