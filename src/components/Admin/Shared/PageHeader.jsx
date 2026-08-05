const PageHeader = ({ icon, eyebrow, title, subtitle, actions }) => (
    <div className="ag-page-header">
        <div>
            {eyebrow && (
                <div className="ag-eyebrow">
                    {icon}
                    <span>{eyebrow}</span>
                </div>
            )}
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="ag-flex ag-gap-12">{actions}</div>}
    </div>
);

export default PageHeader;